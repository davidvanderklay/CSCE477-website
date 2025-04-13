"use client"; // Needs to be a client component for form handling

import { AuthForm } from "@/components/AuthForm";
import { z } from "zod";
import Link from "next/link";

// Define schema specifically for registration
const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  // **Client-side Validation Note:** We validate name length here.
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional().or(z.literal('')), // Allow empty string or min 2 chars
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});


export default function RegisterPage() {

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    // Ensure empty string name becomes undefined for the API if desired, or handle in API
    const payload = {
      ...values,
      name: values.name || undefined,
    };

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific API errors if available
      const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Registration failed');
      throw new Error(errorMessage);
    }
    return data; // Return data on success
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <AuthForm
        mode="register"
        schema={registerSchema}
        onSubmit={handleRegister}
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
