"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, CreditCard, LogOut, Music2, UserPlus } from "lucide-react";
import { parentLogout } from "@/app/actions/parent";

const navItems = [
  { name: "Overview", href: "/parent/dashboard", icon: Home },
  { name: "Register Child", href: "/parent/dashboard/register", icon: UserPlus },
  { name: "Attendance", href: "/parent/dashboard/attendance", icon: CalendarCheck },
  { name: "Fees & Payment", href: "/parent/dashboard/fees", icon: CreditCard },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show layout on login page
  if (pathname === "/parent/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">DIL Academy</span>
            <span className="ml-2 text-xs text-slate-500 font-medium">Parent Portal</span>
          </div>
        </div>
        <button
          onClick={() => parentLogout()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab Navigation */}
        <nav className="flex gap-1 bg-white/5 p-1 rounded-2xl mb-6 border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-pink-600 text-white shadow-lg shadow-purple-900/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
