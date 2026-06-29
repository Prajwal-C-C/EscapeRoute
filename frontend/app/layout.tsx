import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Merge these into one provider wrapper
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EscapeRoute - AI Travel Planner",
  description: "Plan smarter. Travel better.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap with the SessionProvider correctly */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}