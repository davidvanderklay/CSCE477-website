// components/AuthForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // Import signIn

interface AuthFormProps {
  mode: 'login' | 'register';
  schema: z.ZodObject<any, any>;
  // Update onSubmit for registration only
  onSubmitRegister?: (values: z.infer<AuthFormProps['schema']>) => Promise<any>;
  title: string;
  description: string;
  submitButtonText: string;
}

export function AuthForm({ mode, schema, onSubmitRegister, title, description, submitButtonText }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === 'register' && { name: "" })
    },
  });

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        // --- Use next-auth signIn ---
        const result = await signIn('credentials', {
          redirect: false, // Handle redirect manually
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          console.error("SignIn Error:", result.error);
          // Use a generic message from next-auth error or provide your own
          toast.error("Login Failed", { description: "Invalid email or password." });
        } else if (result?.ok) {
          toast.success("Login Successful", { description: "Redirecting to dashboard..." });
          router.push('/dashboard'); // Redirect to dashboard on success
          router.refresh(); // Optional: Refresh server components
        } else {
          // Handle unexpected cases
          toast.error("Login Failed", { description: "An unexpected error occurred." });
        }
        // --- End next-auth signIn ---
      } else if (mode === 'register' && onSubmitRegister) {
        // --- Keep existing registration logic ---
        await onSubmitRegister(values); // Call the passed onSubmit function
        toast.success("Registration Successful", { description: "You can now log in." });
        router.push('/login'); // Redirect to login after registration
        // --- End registration logic ---
      }
    } catch (error: any) {
      // Catch errors specifically from registration submit handler
      console.error("Form submission error (Register):", error);
      const errorMessage = error?.message || "An unexpected error occurred.";
      toast.error(`Error during ${mode}`, {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // ... rest of the component remains the same (return statement) ...
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
            {mode === 'register' && (
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
