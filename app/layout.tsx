// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers"; // Import the new Providers component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Secure App",
  description: "Homework Assignment App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap children with Providers */}
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
