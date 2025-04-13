"use client"; // Needs to be a client component for form handling

import { AuthForm } from "@/components/AuthForm";
import { z } from "zod";
import Link from "next/link";

// Define schema specifically for login
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }), // Simple client-side check
});

export default function LoginPage() {

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data; // Return data (including userName) on success
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthForm
        mode="login"
        schema={loginSchema}
        onSubmit={handleLogin}
        title="Login"
        description="Enter your credentials to access your account."
        submitButtonText="Log In"
      />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </Link>
      </p>
    </div>
  );
}
