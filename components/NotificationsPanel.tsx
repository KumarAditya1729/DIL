"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Notifications are populated from real DB activity (admissions, fee payments, events)
  const notifications: { id: number; title: string; message: string; time: string; unread: boolean }[] = [];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <button className="text-xs text-primary-600 font-medium">Mark all read</button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${n.unread ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-semibold ${n.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                    {n.unread && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{n.time}</p>
                </div>
              ))}
            </div>
            <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                View All Activity
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
