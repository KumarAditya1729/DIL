"use client";

import { useState, useEffect } from "react";
import { Search, User, Calendar, CreditCard, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            autoFocus
            type="text" 
            placeholder="What do you need?" 
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
          />
          <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium px-2">ESC</button>
        </div>
        
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</div>
          <button onClick={() => { setIsOpen(false); router.push('/dashboard/students/new'); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
            <User className="w-4 h-4 text-primary-500" />
            Add New Student Admission
          </button>
          <button onClick={() => { setIsOpen(false); router.push('/dashboard/attendance'); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
            <Calendar className="w-4 h-4 text-green-500" />
            Mark Today&apos;s Attendance
          </button>
          <button onClick={() => { setIsOpen(false); router.push('/dashboard/fees'); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
            <CreditCard className="w-4 h-4 text-amber-500" />
            Collect Fee Payment
          </button>

          <div className="px-3 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Students</div>
          <button onClick={() => { setIsOpen(false); router.push('/dashboard/students/DA-2026-001'); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">A</div>
            Aarav Patel <span className="text-slate-400 font-normal ml-auto">DA-2026-001</span>
          </button>
        </div>
      </div>
    </div>
  );
}
