"use client"; // Need client component to read search params

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from 'react'; // Import Suspense

// Component to actually read params and render content
function DashboardContent() {
  const searchParams = useSearchParams();
  // **VULNERABILITY POINT FOR PART 3:**
  // Get the name directly from the query parameter.
  // In a secure app, you'd verify a session/token and fetch user data server-side.
  const name = searchParams.get('name') || 'User';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to your Dashboard!</CardTitle>
        </CardHeader>
        <CardContent>
          {/*
                    **VULNERABILITY POINT FOR PART 3:**
                    Displaying the name directly from the query parameter WITHOUT sanitization.
                    If the name contains HTML/JS (like <script>alert('XSS')</script>),
                    React *might* escape it by default when rendering directly as text.
                    However, let's simulate a case where it might not be escaped,
                    or where a developer might mistakenly use dangerouslySetInnerHTML.
                    For clarity, we'll just render it directly, assuming React's default
                    escaping might be bypassed or insufficient in a more complex scenario,
                    or to explicitly show the *intent* of the vulnerability.
                    The *exploit* in Part 3 will rely on this direct rendering.
                    */}
          <p>Hello there, <span className="font-semibold">{name}</span>!</p>
          <p className="mt-4 text-sm text-gray-600">This is a very basic dashboard page.</p>
          {/* Example of how it *could* be vulnerable if misused: */}
          {/* <p>Your name (dangerously): <span dangerouslySetInnerHTML={{ __html: name }}></span></p> */}
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component using Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
