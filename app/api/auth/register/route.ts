import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(), // Optional name
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, name, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 }); // Conflict
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user - **Input Sanitization Note:** Prisma helps prevent SQL Injection here.
    // We are storing the name as provided.
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null, // Store name directly
        password: hashedPassword,
      },
    });

    // Don't return password hash
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
