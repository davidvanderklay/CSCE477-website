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

interface RouteParams {
  params: { taskId: string };
}

// Helper function to check ownership
async function checkTaskOwnership(taskId: number, userId: number): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  // Ensure task exists and belongs to the user
  return !!task && task.userId === userId;
}


// PUT /api/tasks/[taskId] - Update a specific task
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const taskId = parseInt(params.taskId, 10);

  if (isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);

  try {
    // Verify ownership before update
    const isOwner = await checkTaskOwnership(taskId, userId);
    if (!isOwner) {
      // Return 404 if task doesn't exist or 403 if it exists but isn't owned
      // Returning 404 might be slightly better to not reveal task existence
      return NextResponse.json({ message: 'Task not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Ensure at least one field is being updated
    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
        // You could add userId here too for an extra layer, though checkTaskOwnership handles it
        // userId: userId
      },
      data: validation.data, // Only pass validated fields
    });
    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    // Handle specific errors like Prisma's P2025 (Record to update not found)
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error updating task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[taskId] - Delete a specific task
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const taskId = parseInt(params.taskId, 10);

  if (isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);

  try {
    // Verify ownership before delete
    const isOwner = await checkTaskOwnership(taskId, userId);
    if (!isOwner) {
      // Return 404 if task doesn't exist or 403 if it exists but isn't owned
      return NextResponse.json({ message: 'Task not found or access denied' }, { status: 404 });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
        // userId: userId // Optional extra check
      },
    });
    // Return 204 No Content for successful deletions is common practice
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    // Handle specific errors like Prisma's P2025 (Record to delete not found)
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
  }
}
