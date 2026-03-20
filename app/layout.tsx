import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Engineering Manager",
  description: "AI-powered engineering growth management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} antialiased selection:bg-indigo-500/30`}>
        <div className="flex w-full min-h-screen">
          <Navigation />
          <main className="flex-1 md:pl-64 min-h-screen flex flex-col pt-8 px-4 sm:px-6 lg:px-12 pb-24 md:pb-12 w-full max-w-7xl mx-auto overflow-x-hidden">
            {children}
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
