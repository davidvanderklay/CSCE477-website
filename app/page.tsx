import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">Welcome!</h1>
      <p>Please log in or register.</p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
}
