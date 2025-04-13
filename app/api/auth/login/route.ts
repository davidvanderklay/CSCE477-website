import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }), // Basic check
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Generic error message to prevent email enumeration
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Generic error message
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // **VULNERABILITY SETUP FOR PART 3:**
    // In a real app, you'd set up a secure session (e.g., JWT, NextAuth.js).
    // Here, we'll just return the user's name (if it exists) to be used
    // insecurely on the client-side for demonstration purposes.
    const responsePayload = {
      message: 'Login successful',
      userName: user.name || 'User' // Send name back
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
