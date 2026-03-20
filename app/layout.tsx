import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import MobileNav from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Boss App | Engineering Growth System",
  description: "AI-driven professional development for engineers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-[#0a0a0f] text-slate-200 overflow-x-hidden`}>
        <Navigation />
        <main className="
          min-h-screen 
          md:ml-64 
          px-4 sm:px-6 md:px-8 lg:px-12 
          py-8 md:py-12 
          pb-24 md:pb-12
          transition-all duration-300
        ">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
