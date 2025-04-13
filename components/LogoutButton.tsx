// components/LogoutButton.tsx
"use client"; // Needs to be client component for onClick

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' }); // Redirect to login after sign out
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Log Out
    </Button>
  );
}
