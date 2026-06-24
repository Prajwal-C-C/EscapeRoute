import type { Metadata } from "next";
<<<<<<< HEAD
import "./globals.css";

export const metadata: Metadata = {
  title: "EscapeRoute | AI Travel Planner",
  description:
    "Plan optimized daily itineraries with smart routing, destination discovery, and travel preferences.",
=======
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EscapeRoute - AI Travel Planner",
  description: "Plan smarter. Travel better.",
>>>>>>> 6f35ad2d354bde8b0058faed3b05219f77f902ab
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
=======
    <html lang="en">
      <body className={inter.className}>{children}</body>
>>>>>>> 6f35ad2d354bde8b0058faed3b05219f77f902ab
    </html>
  );
}