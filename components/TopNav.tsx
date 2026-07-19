"use client";

import { Menu, Search, Sun, Moon, Command, ChevronRight } from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";
import { useTheme } from "./ThemeProvider";
import { usePathname } from "next/navigation";

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(p => p && p !== 'dashboard');

  return (
    <header className="h-16 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 mt-2">
      <div className="flex items-center gap-4 w-full">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-[var(--primary-500)] hover:bg-[var(--primary-100)] dark:hover:bg-[var(--primary-800)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs for larger screens */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-[var(--primary-500)]">
          <span className="text-[var(--foreground)]">DIL</span>
          <ChevronRight className="w-4 h-4 text-[var(--primary-300)]" />
          <span className={pathSegments.length === 0 ? "text-[var(--foreground)]" : ""}>Dashboard</span>
          {pathSegments.map((segment, index) => (
            <div key={segment} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-[var(--primary-300)]" />
              <span className={index === pathSegments.length - 1 ? "text-[var(--foreground)] capitalize" : "capitalize"}>
                {segment}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 lg:flex-none lg:mx-auto max-w-md w-full">
          <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border-color)] soft-shadow px-3 py-2 rounded-[14px] transition-all focus-within:ring-2 focus-within:ring-[var(--foreground)] focus-within:border-[var(--foreground)]">
            <Search className="w-4 h-4 text-[var(--primary-400)]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)] placeholder:text-[var(--primary-400)]"
            />
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-[var(--primary-400)] bg-[var(--primary-50)] dark:bg-[var(--primary-800)] px-1.5 py-0.5 rounded-md border border-[var(--border-color)]">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-[var(--primary-500)] hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--border-color)] transition-all soft-shadow-hover"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <NotificationsPanel />
      </div>
    </header>
  );
}
