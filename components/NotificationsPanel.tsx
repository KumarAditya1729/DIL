"use client";

import { Bell, CheckCheck, Info, MessageSquare, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchLiveNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/communication";

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = () => {
    fetchLiveNotifications().then(setNotifications).catch(console.error);
  };

  useEffect(() => {
    loadNotifications();
    // Periodically fetch notifications every 15 seconds for real-time experience!
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleMarkOneRead = async (id: string) => {
    await markNotificationAsRead(id);
    loadNotifications();
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "whatsapp":
        return MessageSquare;
      case "email":
        return Mail;
      case "sms":
        return Bell;
      default:
        return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "whatsapp":
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
      case "email":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "sms":
        return "text-purple-500 bg-purple-50 dark:bg-purple-900/20";
      default:
        return "text-slate-500 bg-slate-50 dark:bg-slate-900/20";
    }
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
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No announcements or broadcasts yet.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = getIcon(n.type);
                  const color = getColor(n.type);
                  return (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkOneRead(n.id)}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm font-semibold leading-snug ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                          {!n.is_read && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-pre-wrap">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {new Date(n.created_at).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
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
