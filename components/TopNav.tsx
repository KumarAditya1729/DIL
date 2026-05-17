"use client";

import { Menu, Search } from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-primary-500/20">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students, batches... (⌘K)" 
            className="bg-transparent border-none outline-none text-sm w-64 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <NotificationsPanel />
      </div>
    </header>
  );
}
