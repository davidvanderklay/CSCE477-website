"use client";

import { zodResolver } from "@hookform/resolvers/zod";
// Import DefaultValues type from react-hook-form
import { useForm, DefaultValues } from "react-hook-form";
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
import { signIn } from "next-auth/react";

type AnyZodSchema = z.ZodObject<any, any>;

interface AuthFormProps<T extends AnyZodSchema> {
  mode: 'login' | 'register';
  schema: T;
  onSubmitRegister?: (values: z.infer<T>) => Promise<any>;
  title: string;
  description: string;
  submitButtonText: string;
}

export function AuthForm<T extends AnyZodSchema>({
  mode,
  schema,
  onSubmitRegister,
  title,
  description,
  submitButtonText
}: AuthFormProps<T>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // --- Solution: Prepare default values outside useForm ---
  const prepareDefaultValues = (): DefaultValues<z.infer<T>> => {
    // Start with a base structure known to exist (adjust if schemas vary more)
    const defaults: any = { // Use 'any' temporarily for easier construction
      email: "",
      password: "",
    };

    // Conditionally add 'name' if relevant
    if (mode === 'register' && schema.shape.name) {
      defaults.name = "";
    }

    // Add other conditional defaults based on schema/mode if needed...

    // Assert the final constructed object to the type expected by useForm
    return defaults as DefaultValues<z.infer<T>>;
  };
  // --- End Solution ---


  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    // Pass the result of the helper function
    defaultValues: prepareDefaultValues(),
  });

  async function handleFormSubmit(values: z.infer<T>) {
    // ... (rest of the handleFormSubmit function remains the same) ...
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const loginValues = values as { email: string; password: string };

        const result = await signIn('credentials', {
          redirect: false,
          email: loginValues.email,
          password: loginValues.password,
        });

        if (result?.error) {
          console.error("SignIn Error:", result.error);
          toast.error("Login Failed", { description: "Invalid email or password." });
        } else if (result?.ok) {
          toast.success("Login Successful", { description: "Redirecting to dashboard..." });
          router.push('/dashboard');
          router.refresh();
        } else {
          toast.error("Login Failed", { description: "An unexpected error occurred." });
        }
      } else if (mode === 'register' && onSubmitRegister) {
        await onSubmitRegister(values);
        toast.success("Registration Successful", { description: "You can now log in." });
        router.push('/login');
      }
    } catch (error: any) {
      console.error(`Form submission error (${mode}):`, error);
      const errorMessage = error?.message || "An unexpected error occurred.";
      toast.error(`Error during ${mode}`, {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // ... (rest of the component's return statement remains the same) ...
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Use 'email' directly as it's expected in both schemas */}
            <FormField
              control={form.control}
              name={"email" as any} // Use 'as any' if TS complains about generic name, or ensure 'email' exists in T
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
            {/* Conditionally render based on mode AND if 'name' exists in the schema */}
            {mode === 'register' && schema.shape.name && (
              <FormField
                control={form.control}
                name={"name" as any} // Use 'as any' if TS complains, or ensure 'name' exists in T
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
            {/* Use 'password' directly as it's expected in both schemas */}
            <FormField
              control={form.control}
              name={"password" as any} // Use 'as any' if TS complains, or ensure 'password' exists in T
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
