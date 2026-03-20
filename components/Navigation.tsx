"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Compass, 
  Calendar, 
  CheckSquare, 
  Code, 
  LineChart, 
  Settings,
  Clock,
  LogOut
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/roadmap", label: "Roadmap", icon: Calendar },
    { href: "/challenges", label: "Tasks", icon: CheckSquare },
    { href: "/history", label: "History", icon: Clock },
    { href: "/review", label: "Review", icon: Code },
    { href: "/analytics", label: "Analytics", icon: LineChart },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="hidden md:flex flex-col w-64 fixed h-screen bg-black/50 backdrop-blur-xl border-r border-white/10 p-6 z-40">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Settings className="text-white" size={24} />
        </div>
        <span className="font-black text-xl tracking-tighter text-white">AI BOSS</span>
      </div>

      <div className="flex-grow flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
              <span className="font-bold text-sm tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <LogOut size={20} className="text-slate-500 group-hover:text-red-400" />
          <span className="font-bold text-sm tracking-tight">ログアウト</span>
        </button>
      </div>
    </nav>
  );
}
