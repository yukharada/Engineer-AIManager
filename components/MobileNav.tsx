"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Calendar, CheckSquare, Code, LineChart, Clock } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/roadmap", label: "Roadmap", icon: Calendar },
    { href: "/challenges", label: "Tasks", icon: CheckSquare },
    { href: "/history", label: "History", icon: Clock },
    { href: "/review", label: "Review", icon: Code },
    { href: "/analytics", label: "Analytics", icon: LineChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 py-3 md:hidden">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              isActive ? "text-indigo-400" : "text-slate-500"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
