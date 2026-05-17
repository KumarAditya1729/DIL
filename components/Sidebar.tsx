"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Archive, 
  CalendarDays, 
  MessageSquare,
  BarChart3,
  Settings,
  X
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/dashboard/students", icon: Users },
    { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { name: "Fees & Receipts", href: "/dashboard/fees", icon: CreditCard },
    { name: "Past Records", href: "/dashboard/alumni", icon: Archive },
    { name: "Events", href: "/dashboard/events", icon: CalendarDays },
    { name: "Communication", href: "/dashboard/communication", icon: MessageSquare },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 
        z-50 transition-all duration-300 flex flex-col shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 font-bold italic text-xl text-primary-600 dark:text-primary-500">
            <Image src="/logo.png" alt="DIL Logo" width={32} height={32} className="object-contain drop-shadow-sm" />
            <span>DIL Academy</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary-50 to-transparent border-l-4 border-primary-600 text-primary-700 font-semibold dark:from-primary-900/40 dark:text-primary-300' 
                      : 'text-slate-600 hover:bg-slate-50/80 hover:translate-x-1 dark:text-slate-400 dark:hover:bg-slate-800/50 border-l-4 border-transparent'}
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-primary-600 scale-110' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
          <div className="flex items-center gap-3 px-2 mb-4 hover-lift">
          <Image src="/logo.png" alt="Dance Is Life" width={40} height={40} className="object-contain drop-shadow-md" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white leading-tight">Dance Is Life</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Art & Study Center</span>
          </div>
        </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
