"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  Layers,
  GraduationCap,
  X
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { getUserRole } from "@/app/actions/auth";

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    getUserRole().then(role => setUserRole(role || "admin")); 
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/dashboard/students", icon: Users },
    { name: "Teachers", href: "/dashboard/teachers", icon: GraduationCap, adminOnly: true },
    { name: "Batches", href: "/dashboard/batches", icon: Layers },
    { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { name: "Fees & Receipts", href: "/dashboard/fees", icon: CreditCard, adminOnly: true },
    { name: "Past Records", href: "/dashboard/alumni", icon: Archive },
    { name: "Events", href: "/dashboard/events", icon: CalendarDays },
    { name: "Communication", href: "/dashboard/communication", icon: MessageSquare },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3, adminOnly: true },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, adminOnly: true },
  ].filter(item => !item.adminOnly || ['admin', 'owner', 'super_admin', 'academy_admin'].includes(userRole || ''));

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <aside className={`
        fixed top-4 left-4 h-[calc(100vh-2rem)] w-64 bg-[var(--card)] border border-[var(--border-color)]
        z-50 flex flex-col rounded-3xl shadow-sm transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-color)]/50">
          <Link href="/dashboard" className="flex items-center gap-2 outline-none group" onClick={() => setIsOpen(false)}>
            <div className="relative h-8 w-8 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Dance Is Life" fill className="object-contain" sizes="32px" />
            </div>
            <span className="font-semibold text-[var(--foreground)] tracking-tight">DIL Academy</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 no-scrollbar space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block relative outline-none"
                onClick={() => setIsOpen(false)}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[var(--hover-bg)] rounded-xl border border-[var(--border-color)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={`
                  relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]/50'}
                `}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 mt-auto border-t border-[var(--border-color)]/50">
          <div className="bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4 text-[var(--foreground)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-xs text-[var(--foreground)] tracking-tight truncate w-32">Dance Is Life</span>
                <span className="text-[10px] text-[var(--muted)] font-medium tracking-wide uppercase">Academy Plan</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
