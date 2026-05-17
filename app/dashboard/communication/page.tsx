"use client";

import { MessageSquare, Send, BellRing, Phone, Loader2, CheckCircle2, Sparkles, Clock, Users, IndianRupee, CalendarX, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchBroadcasts, createBroadcast } from "@/app/actions/communication";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: "fee_reminder",
    icon: IndianRupee,
    label: "Fee Reminder",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
    audience: "Students with Pending Fees",
    message: `Hello from Dance Is Life Art & Study Center 🎶\n\nThis is a gentle reminder that your monthly fee is due. Kindly clear the dues at the earliest to avoid any inconvenience.\n\nYou can also pay online through the Parent Portal.\n\nThank you! 🙏`,
  },
  {
    id: "holiday",
    icon: CalendarX,
    label: "Holiday Notice",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    audience: "All Active Students",
    message: `Dear Students & Parents,\n\nPlease note that the academy will remain *CLOSED* on [DATE] on account of [HOLIDAY NAME].\n\nClasses will resume on [NEXT DATE] as per the regular schedule.\n\nHave a wonderful holiday! 🎉\n— DIL Academy`,
  },
  {
    id: "event_invite",
    icon: Sparkles,
    label: "Event Invite",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
    audience: "All Active Students",
    message: `🌟 *You're Invited!*\n\nDance Is Life Art & Study Center proudly presents *[EVENT NAME]*\n\n📅 Date: [DATE]\n⏰ Time: [TIME]\n📍 Venue: [VENUE]\n\nDon't miss this spectacular showcase! We look forward to seeing you there. 💃🕺\n\nFor registrations, contact your batch teacher.`,
  },
  {
    id: "attendance_alert",
    icon: CalendarX,
    label: "Attendance Alert",
    color: "text-red-500 bg-red-50 dark:bg-red-900/20",
    audience: "Parents Only",
    message: `Dear Parent,\n\nThis is to inform you that your child's attendance at Dance Is Life Art & Study Center has dropped below 75%.\n\nRegular attendance is crucial for skill development. Please ensure your child attends classes regularly.\n\nFor any concerns, please reach out to us directly.\n\nThank you,\nDIL Academy`,
  },
  {
    id: "schedule_change",
    icon: Clock,
    label: "Schedule Change",
    color: "text-green-500 bg-green-50 dark:bg-green-900/20",
    audience: "All Active Students",
    message: `📢 *Schedule Update*\n\nDear Students,\n\nPlease note that the [BATCH NAME] class timings have been changed:\n\n🕐 New Time: [NEW TIME]\n📅 Effective from: [DATE]\n\nThe venue remains the same. For queries, contact your batch teacher.\n\n— DIL Academy Team`,
  },
];

type Broadcast = {
  id: string;
  title: string;
  message: string;
  audience: string;
  channel: string;
  date: string;
  sent_count: number;
};

const MAX_CHARS = 1024;

export default function CommunicationPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [message, setMessage]       = useState("");
  const [audience, setAudience]     = useState("All Active Students");
  const [isSending, setIsSending]   = useState(false);
  const [useWhatsApp, setUseWhatsApp] = useState(true);
  const [useInApp, setUseInApp]     = useState(true);
  const [activeTab, setActiveTab]   = useState<"compose" | "history">("compose");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => { loadBroadcasts(); }, []);

  const loadBroadcasts = async () => {
    setIsLoadingHistory(true);
    const data = await fetchBroadcasts();
    setBroadcasts(
      data.map((b: any) => ({
        id:         b.id,
        title:      b.title || "Untitled",
        message:    b.message,
        audience:   b.title,
        channel:    b.type,
        date:       new Date(b.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        sent_count: b.sent_count || 0,
      }))
    );
    setIsLoadingHistory(false);
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setMessage(tpl.message);
    setAudience(tpl.audience);
    toast.success(`Template "${tpl.label}" applied!`);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);

    if (useWhatsApp) {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    }

    const formData = new FormData();
    formData.append("audience", audience);
    formData.append("message", message);
    formData.append("channel", [useWhatsApp && "WhatsApp", useInApp && "In-App"].filter(Boolean).join(", "));

    const res = await createBroadcast(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Broadcast sent & saved to history!");
      setMessage("");
      loadBroadcasts();
      setActiveTab("history");
    }
    setIsSending(false);
  };

  const charPct = Math.min((message.length / MAX_CHARS) * 100, 100);
  const charColor = charPct > 90 ? "text-red-500" : charPct > 70 ? "text-orange-500" : "text-slate-400";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary-500" /> Communication Hub
        </h1>
        <p className="text-slate-500 text-sm mt-1">Send announcements and bulk messages to students and parents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Compose + History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            {(["compose", "history"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab === "history" ? `History (${broadcasts.length})` : "Compose"}
              </button>
            ))}
          </div>

          {/* Compose Tab */}
          {activeTab === "compose" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5">
              {/* Audience */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" /> Target Audience
                </label>
                <div className="relative">
                  <select
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-slate-200 appearance-none"
                  >
                    <option>All Active Students</option>
                    <option>Junior A (Mon, Wed, Fri)</option>
                    <option>Senior B (Tue, Thu, Sat)</option>
                    <option>Weekend Pro (Sat, Sun)</option>
                    <option>Classical Beginners</option>
                    <option>Parents Only</option>
                    <option>Students with Pending Fees</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Channels */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Channels</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={useWhatsApp} onChange={e => setUseWhatsApp(e.target.checked)} className="rounded accent-green-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-green-500" /> WhatsApp
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={useInApp} onChange={e => setUseInApp(e.target.checked)} className="rounded accent-primary-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5 text-primary-500" /> In-App
                    </span>
                  </label>
                </div>
              </div>

              {/* Message Textarea */}
              <form onSubmit={handleSend} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Content</label>
                  <textarea
                    rows={7}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Type your announcement here, or pick a template on the right →"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200 resize-none font-mono leading-relaxed"
                  />
                  {/* Char counter */}
                  <div className="flex items-center justify-between">
                    <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full mr-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${charPct > 90 ? "bg-red-400" : charPct > 70 ? "bg-orange-400" : "bg-primary-400"}`}
                        style={{ width: `${charPct}%` }}
                      />
                    </div>
                    <span className={`text-xs tabular-nums ${charColor}`}>{message.length}/{MAX_CHARS}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isSending ? "Sending..." : "Send Broadcast"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Sent Broadcasts</h2>
              </div>
              {isLoadingHistory ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
              ) : broadcasts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm">No broadcasts sent yet. Compose your first message!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {broadcasts.map((b, i) => (
                    <div key={i} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                            <BellRing className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{b.audience}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{b.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-slate-400">{b.date}</span>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{b.channel}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-500 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Sent</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Templates */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" /> Message Templates
            </h3>
            <p className="text-xs text-slate-500 mb-4">Click any template to auto-fill the compose form.</p>
            <div className="space-y-2">
              {TEMPLATES.map(tpl => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => { applyTemplate(tpl); setActiveTab("compose"); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tpl.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{tpl.label}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{tpl.audience}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Status */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 rounded-full blur-3xl opacity-10 translate-x-1/3 -translate-y-1/3" />
            <h3 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-green-400" /> WhatsApp Ready
            </h3>
            <p className="text-xs text-slate-400 mb-3">Messages open WhatsApp Web with your text pre-filled.</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-medium text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
