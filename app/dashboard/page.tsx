// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton"; // We'll create this next
import MemoryGame from "@/components/MemoryGame"; // We'll create this soon

export default async function DashboardPage() {
  // Fetch session data on the server
  const session = await getServerSession(authOptions);

  // If no session, redirect to login page
  if (!session || !session.user) {
    redirect('/login'); // Or redirect('/api/auth/signin')
  }

  // Get user name securely from the session object
  const userName = session.user.name || session.user.email || 'User'; // Fallback if name is null

  return (
    <div className="flex min-h-screen flex-col items-center p-4 pt-10 md:p-10">
      <Card className="w-full max-w-4xl mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Welcome to your Dashboard!</CardTitle>
            {/* Display name securely from session */}
            <CardDescription>Hello there, <span className="font-semibold">{userName}</span>!</CardDescription>
          </div>
          <LogoutButton /> {/* Add logout button */}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">Here's your memory game:</p>
          {/* Add the Memory Game Component */}
          <MemoryGame />
        </CardContent>
      </Card>
      {/* You can add more dashboard content here */}
    </div>
  );
}
