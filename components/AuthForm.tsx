"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner"; // ADD this line
import { useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

interface AuthFormProps {
  mode: 'login' | 'register';
  schema: z.ZodObject<any, any>; // Accept any Zod object schema
  onSubmit: (values: z.infer<AuthFormProps['schema']>) => Promise<any>; // Async submit handler
  title: string;
  description: string;
  submitButtonText: string;
}

export function AuthForm({ mode, schema, onSubmit, title, description, submitButtonText }: AuthFormProps) {
  // const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    // REMOVE schema.parse() here - just provide the object directly
    defaultValues: {
      email: "",
      password: "",
      // This conditional spread for 'name' is correct
      ...(mode === 'register' && { name: "" })
    },
  });

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      const result = await onSubmit(values); // Call the passed onSubmit function

      if (mode === 'login') {
        // Use sonner's success toast
        toast.success("Login Successful", { description: "Redirecting..." }); // UPDATED
        const userName = result?.userName || 'User';
        router.push(`/dashboard?name=${encodeURIComponent(userName)}`);
      } else {
        // Use sonner's success toast
        toast.success("Registration Successful", { description: "You can now log in." }); // UPDATED
        router.push('/login');
      }

    } catch (error: any) {
      console.error("Form submission error:", error);
      const errorMessage = error?.message || "An unexpected error occurred.";
      toast.error(`Error during ${mode}`, { // UPDATED
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === 'register' && ( // Only show name field for registration
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : submitButtonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
