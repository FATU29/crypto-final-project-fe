import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/layout";
import { Toaster } from "@/components/ui/sonner";
import ChatBubbleButtonWrapper from "@/components/chat/ChatBubbleButtonWrapper";

export const metadata: Metadata = {
  title: "Crypto Trading Platform",
  description: "Real-time cryptocurrency trading and analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Suppress hydration warnings that can be triggered by browser extensions
        // or other client-only DOM attribute injections (e.g. analytics or A/B
        // testing extensions). If you reproduce this in a clean browser
        // (incognito without extensions) and the warning disappears, remove
        // this flag.
        suppressHydrationWarning
        className="antialiased"
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
          <ChatBubbleButtonWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
