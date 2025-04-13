// components/TaskList.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner'; // Using sonner

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, Loader2 } from 'lucide-react'; // Icons

// Define the Task type matching Prisma model (adjust if needed)
interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string; // Dates will likely be strings from JSON
  updatedAt: string;
}

// Schema for the add task input
const addTaskSchema = z.object({
  title: z.string().min(1, "Task title cannot be empty.").max(255, "Task title too long."),
});

// Schema for the edit task form
const editTaskSchema = z.object({
  title: z.string().min(1, "Task title cannot be empty.").max(255, "Task title too long."),
});

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<Task | null>(null); // Holds task being edited
  const [isDeleting, setIsDeleting] = useState<Task | null>(null); // Holds task being deleted

  // --- Data Fetching ---
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- Form Handling (Add Task) ---
  const addForm = useForm<z.infer<typeof addTaskSchema>>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { title: "" },
  });

  const handleAddTask = async (values: z.infer<typeof addTaskSchema>) => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add task');
      }
      const newTask = await response.json();
      setTasks((prevTasks) => [newTask, ...prevTasks]); // Add to top
      addForm.reset(); // Clear input field
      toast.success("Task added!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error adding task.");
    } finally {
      setIsAdding(false);
    }
  };

  // --- Task Actions ---
  const handleToggleComplete = async (task: Task) => {
    const updatedCompleted = !task.completed;
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: updatedCompleted } : t));

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedCompleted }),
      });
      if (!response.ok) {
        // Revert optimistic update on failure
        setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: task.completed } : t));
        throw new Error('Failed to update task status');
      }
      // Optional: fetchTasks() again or update state with response data if needed
      // toast.success(`Task marked as ${updatedCompleted ? 'complete' : 'incomplete'}.`);
    } catch (error) {
      console.error(error);
      toast.error("Error updating task status.");
      // Ensure UI reverts if fetch fails after optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: task.completed } : t));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!isDeleting || isDeleting.id !== taskId) return; // Should not happen, but safety check

    // Optimistic UI update
    const originalTasks = tasks;
    setTasks(tasks.filter(t => t.id !== taskId));
    setIsDeleting(null); // Close confirmation dialog

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        // Revert optimistic update
        setTasks(originalTasks);
        throw new Error('Failed to delete task');
      }
      toast.success("Task deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting task.");
      // Ensure UI reverts if fetch fails
      setTasks(originalTasks);
    }
  };


  // --- Edit Task Form Handling ---
  const editForm = useForm<z.infer<typeof editTaskSchema>>({
    resolver: zodResolver(editTaskSchema),
    // Default values set when dialog opens
  });

  // Set default values when edit dialog opens
  useEffect(() => {
    if (isEditing) {
      editForm.reset({ title: isEditing.title });
    }
  }, [isEditing, editForm]);

  const handleEditTaskSubmit = async (values: z.infer<typeof editTaskSchema>) => {
    if (!isEditing) return;

    const originalTasks = tasks;
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === isEditing.id ? { ...t, title: values.title } : t));
    const taskToClose = isEditing; // Store task before closing dialog
    setIsEditing(null); // Close dialog

    try {
      const response = await fetch(`/api/tasks/${taskToClose.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: values.title }),
      });
      if (!response.ok) {
        setTasks(originalTasks); // Revert
        throw new Error('Failed to update task title');
      }
      toast.success("Task updated!");
      // Optionally update state with response if backend modifies data
    } catch (error) {
      console.error(error);
      toast.error("Error updating task title.");
      setTasks(originalTasks); // Revert
    }
  };


  // --- Render Logic ---
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
        {/* Add Task Form */}
        <Form {...addForm}>
          <form onSubmit={addForm.handleSubmit(handleAddTask)} className="flex gap-2 pt-4">
            <FormField
              control={addForm.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  {/* <FormLabel className="sr-only">New Task</FormLabel> */}
                  <FormControl>
                    <Input placeholder="Add a new task..." {...field} disabled={isAdding} />
                  </FormControl>
                  <FormMessage className="text-xs pt-1" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isAdding}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </form>
        </Form>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No tasks yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task)}
                  aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <Label
                  htmlFor={`task-${task.id}`}
                  className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditing(task)} // Open edit dialog
                  aria-label={`Edit task "${task.title}"`}
                  disabled={task.completed} // Disable edit if completed? Optional.
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setIsDeleting(task)} // Open delete confirmation
                  aria-label={`Delete task "${task.title}"`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {tasks.length > 0 && !isLoading && (
        <CardFooter className="text-sm text-muted-foreground">
          {tasks.filter(t => !t.completed).length} task(s) remaining.
        </CardFooter>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the title for your task.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTaskSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the task:
              <br />
              <strong className="break-all">{isDeleting?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleDeleteTask(isDeleting!.id)} // Call delete handler
            >
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default TaskList;
