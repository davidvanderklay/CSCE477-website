// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a task
const createTaskSchema = z.object({
  title: z.string().min(1, { message: "Task title cannot be empty." }).max(255),
});

// GET /api/tasks - Fetch tasks for the logged-in user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: parseInt(session.user.id, 10), // Ensure ID is number
      },
      orderBy: {
        createdAt: 'desc', // Show newest tasks first
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task for the logged-in user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title: validation.data.title,
        userId: parseInt(session.user.id, 10),
      },
    });
    return NextResponse.json(newTask, { status: 201 });

  } catch (error) {
    console.error("Error creating task:", error);
    // Handle potential Prisma errors like unique constraints if needed
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}
