"use client";

import { MessageSquare, Send, BellRing, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

type Broadcast = { title: string; audience: string; date: string; channel: string };

import { fetchBroadcasts, createBroadcast } from "@/app/actions/communication";
import { toast } from "sonner";

export default function CommunicationPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Active Students");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [useWhatsApp, setUseWhatsApp] = useState(true);
  const [useInApp, setUseInApp] = useState(true);

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    const data = await fetchBroadcasts();
    setBroadcasts(data.map((b: any) => ({
      title: b.message.slice(0, 50) + (b.message.length > 50 ? '...' : ''),
      audience: b.title,
      date: new Date(b.created_at).toLocaleDateString(),
      channel: b.type
    })));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);

    if (useWhatsApp) {
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }

    const formData = new FormData();
    formData.append("audience", audience);
    formData.append("message", message);
    formData.append("channel", [useWhatsApp && "WhatsApp", useInApp && "In-App"].filter(Boolean).join(", "));

    const res = await createBroadcast(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      setMessage("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      toast.success("Broadcast sent successfully!");
      loadBroadcasts();
    }
    
    setIsSending(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-slate-500" />
            Communication Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1">Send announcements and bulk messages to students and parents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Compose Broadcast</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-slate-200">
                  <option>All Active Students</option>
                  <option>Junior Batch</option>
                  <option>Senior Batch</option>
                  <option>Weekend Batch</option>
                  <option>Parents Only</option>
                  <option>Students with Pending Fees</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Channel</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={useInApp} onChange={e => setUseInApp(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                    In-App Notification
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={useWhatsApp} onChange={e => setUseWhatsApp(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                    WhatsApp
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Content</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your announcement here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {sent && (
                  <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Broadcast sent!
                  </span>
                )}
                <button type="submit" disabled={isSending || !message.trim()} className="ml-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSending ? "Sending..." : "Send Broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl border border-primary-500 shadow-xl shadow-primary-500/10 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-lg font-bold text-white mb-2 relative z-10 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-400" /> WhatsApp
            </h3>
            <p className="text-sm text-slate-300 mb-4 relative z-10">
              Clicking Send with WhatsApp enabled will open WhatsApp Web with your message pre-filled.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Ready
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Recent Broadcasts</h3>
            {broadcasts.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No broadcasts sent yet.</p>
            ) : (
              <div className="space-y-4">
                {broadcasts.map((b, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{b.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.audience} • {b.channel} • {b.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
