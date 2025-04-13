// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
// Remove MemoryGame import
// import MemoryGame from "@/components/MemoryGame";
// Add TaskList import
import TaskList from "@/components/TaskList"; // Import the new component

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const userName = session.user.name || session.user.email || 'User';

  return (
    <div className="flex min-h-screen flex-col items-center p-4 pt-10 md:p-10">
      <Card className="w-full max-w-2xl mb-6"> {/* Adjusted max-width */}
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Welcome to your Dashboard!</CardTitle>
            <CardDescription>Hello there, <span className="font-semibold">{userName}</span>!</CardDescription>
          </div>
          <LogoutButton />
        </CardHeader>
        {/* CardContent might not be needed here if TaskList uses its own Card */}
      </Card>

      {/* Add the TaskList Component directly */}
      <div className="w-full max-w-2xl"> {/* Container for TaskList */}
        <TaskList />
      </div>

    </div>
  );
}
