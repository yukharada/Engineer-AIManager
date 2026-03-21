"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TrendingUp, 
  Map as MapIcon, 
  CheckSquare, 
  Search, 
  History, 
  Layout, 
  User, 
  Database,
  Calendar,
  LogOut
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: <Layout size={20} />, label: "ダッシュボード" },
    { href: "/challenges", icon: <CheckSquare size={20} />, label: "週間チャレンジ" },
    { href: "/roadmap", icon: <MapIcon size={20} />, label: "ロードマップ" },
    { href: "/history", icon: <History size={20} />, label: "レビュー履歴" },
    { href: "/monthly", icon: <Calendar size={20} />, label: "今月の振り返り" },
    { href: "/analytics", icon: <TrendingUp size={20} />, label: "成長分析" },
    { href: "/migrate", icon: <Database size={20} />, label: "データ移行" },
  ];

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-white/5 hidden md:flex flex-col z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10 group cursor-default">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter italic">AI BOSS APP</span>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm group ${
                  isActive
                    ? "bg-white text-black shadow-xl shadow-white/5"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <span className={`${isActive ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-400"} transition-colors`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-8 space-y-4">
        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4 shadow-inner">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                 <User className="text-indigo-400" size={16} />
              </div>
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Active Engineer</span>
           </div>
           <button className="w-full flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em] font-jp">
              <LogOut size={12} /> ログアウト
           </button>
        </div>
      </div>
    </nav>
  );
}
