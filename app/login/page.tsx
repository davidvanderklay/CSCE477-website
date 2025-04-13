// app/login/page.tsx
"use client";

import { AuthForm } from "@/components/AuthForm";
import { z } from "zod";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

export default function LoginPage() {
  // No separate handleLogin needed here anymore, logic is in AuthForm

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthForm
        mode="login"
        schema={loginSchema}
        // No onSubmit needed for login mode now
        title="Login"
        description="Enter your credentials to access your account."
        submitButtonText="Log In"
      />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </Link>
      </p>
    </div>
  );
}
