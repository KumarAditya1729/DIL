"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarCheck, CreditCard, LogOut, UserPlus, Sparkles } from "lucide-react";
import { parentLogout } from "@/app/actions/parent";

const bottomNavItems = [
  { name: "Home", href: "/parent/dashboard", icon: Home },
  { name: "Attendance", href: "/parent/dashboard/attendance", icon: CalendarCheck },
  { name: "Fees", href: "/parent/dashboard/fees", icon: CreditCard },
  { name: "Register", href: "/parent/dashboard/register", icon: UserPlus },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show layout on login page
  if (pathname === "/parent/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-pink-50 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl relative min-h-screen overflow-hidden flex flex-col">
        {/* Top Header */}
        <header className="px-6 py-5 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF2A55] to-[#FF4B72] flex items-center justify-center shadow-lg shadow-pink-500/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-lg leading-tight">Dance Tuts</h1>
              <p className="text-xs text-pink-500 font-bold tracking-wide uppercase">Parent Portal</p>
            </div>
          </div>
          <button
            onClick={() => parentLogout()}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#FF2A55] hover:bg-pink-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          {children}
        </main>

        {/* Floating Bottom Navigation */}
        <div className="absolute bottom-6 left-6 right-6">
          <nav className="bg-white rounded-full shadow-xl shadow-pink-900/10 border border-pink-100 flex items-center justify-between px-2 py-2">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-tr from-[#FF2A55] to-[#FF4B72] text-white shadow-md shadow-pink-500/30 -translate-y-1"
                      : "text-slate-400 hover:text-pink-500 hover:bg-pink-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "mb-1" : ""}`} />
                  {isActive && <span className="text-[10px] font-bold">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
