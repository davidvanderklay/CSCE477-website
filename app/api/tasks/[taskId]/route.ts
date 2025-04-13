// app/api/tasks/[taskId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for updating a task
const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});

// Define the shape of the context object passed to the route handler
// IMPORTANT: params is now a Promise resolving to the object
interface RouteHandlerContext {
  params: Promise<{ taskId: string }>; // <-- Correct type: Promise
}

// Helper function to check ownership (keep as is)
async function checkTaskOwnership(taskId: number, userId: number): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  // Ensure task exists and belongs to the user
  return !!task && task.userId === userId;
}


// PUT /api/tasks/[taskId] - Update a specific task
export async function PUT(request: Request, context: RouteHandlerContext) { // <-- Keep context
  const session = await getServerSession(authOptions);

  // Await the params promise first!
  const resolvedParams = await context.params; // <-- Await the promise
  const taskIdString = resolvedParams.taskId; // <-- Access taskId from the resolved object
  const taskId = parseInt(taskIdString, 10);

  if (isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10); // Consider if user.id is already a number

  try {
    // Verify ownership before update
    const isOwner = await checkTaskOwnership(taskId, userId);
    if (!isOwner) {
      return NextResponse.json({ message: 'Task not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: validation.data,
    });
    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId] - Delete a specific task
export async function DELETE(request: Request, context: RouteHandlerContext) { // <-- Keep context
  const session = await getServerSession(authOptions);

  // Await the params promise first!
  const resolvedParams = await context.params; // <-- Await the promise
  const taskIdString = resolvedParams.taskId; // <-- Access taskId from the resolved object
  const taskId = parseInt(taskIdString, 10);

  if (isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10); // Consider if user.id is already a number

  try {
    // Verify ownership before delete
    const isOwner = await checkTaskOwnership(taskId, userId);
    if (!isOwner) {
      return NextResponse.json({ message: 'Task not found or access denied' }, { status: 404 });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
  }
}
