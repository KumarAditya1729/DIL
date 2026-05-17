"use client";

import { Bell, CheckCheck, GraduationCap, CreditCard, CalendarDays, Info } from "lucide-react";
import { useState } from "react";

const defaultNotifications = [
  { id: 1, title: "New Student Enrolled", message: "A new student has been added to the Morning Batch.", time: "2 min ago", unread: true, icon: GraduationCap, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  { id: 2, title: "Fee Payment Received", message: "₹4,500 received from Arjun Mehta for June batch fees.", time: "1 hour ago", unread: true, icon: CreditCard, color: "text-green-500 bg-green-50 dark:bg-green-900/20" },
  { id: 3, title: "Upcoming Event", message: "Annual Dance Showcase is scheduled for this Saturday.", time: "3 hours ago", unread: true, icon: CalendarDays, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
  { id: 4, title: "Attendance Alert", message: "5 students missed today's Contemporary batch.", time: "5 hours ago", unread: false, icon: Info, color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
];

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markOneRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread</p>
              </div>
              <button 
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div 
                    key={n.id} 
                    onClick={() => markOneRead(n.id)}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${n.unread ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm font-semibold leading-snug ${n.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                        {n.unread && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                View All Activity →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
