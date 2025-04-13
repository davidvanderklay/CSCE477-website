// app/register/page.tsx
"use client";

import { AuthForm } from "@/components/AuthForm";
import { z } from "zod";
import Link from "next/link";

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional().or(z.literal('')),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function RegisterPage() {

  // Keep the registration API call logic
  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    const payload = {
      ...values,
      name: values.name || undefined,
    };
    const response = await fetch('/api/auth/register', { // Keep using your register API
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Registration failed');
      throw new Error(errorMessage); // Throw error to be caught by AuthForm
    }
    return data;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthForm
        mode="register"
        schema={registerSchema}
        onSubmitRegister={handleRegister} // Pass the handler here
        title="Register"
        description="Create a new account."
        submitButtonText="Register"
      />
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Login here
        </Link>
      </p>
    </div>
  );
}
