"use client";

import { MessageSquare, Send, BellRing, Phone, Loader2, CheckCircle2, Sparkles, Clock, Users, IndianRupee, CalendarX, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchBroadcasts, createBroadcast } from "@/app/actions/communication";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TEMPLATES = [
  {
    id: "fee_reminder",
    icon: IndianRupee,
    label: "Fee Reminder",
    color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    audience: "Students with Pending Fees",
    message: `Hello from Dance Is Life Art & Study Center 🎶\n\nThis is a gentle reminder that your monthly fee is due. Kindly clear the dues at the earliest to avoid any inconvenience.\n\nYou can also pay online through the Parent Portal.\n\nThank you! 🙏`,
  },
  {
    id: "holiday",
    icon: CalendarX,
    label: "Holiday Notice",
    color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    audience: "All Active Students",
    message: `Dear Students & Parents,\n\nPlease note that the academy will remain *CLOSED* on [DATE] on account of [HOLIDAY NAME].\n\nClasses will resume on [NEXT DATE] as per the regular schedule.\n\nHave a wonderful holiday! 🎉\n— DIL Academy`,
  },
  {
    id: "event_invite",
    icon: Sparkles,
    label: "Event Invite",
    color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
    audience: "All Active Students",
    message: `🌟 *You're Invited!*\n\nDance Is Life Art & Study Center proudly presents *[EVENT NAME]*\n\n📅 Date: [DATE]\n⏰ Time: [TIME]\n📍 Venue: [VENUE]\n\nDon't miss this spectacular showcase! We look forward to seeing you there. 💃🕺\n\nFor registrations, contact your batch teacher.`,
  },
  {
    id: "attendance_alert",
    icon: CalendarX,
    label: "Attendance Alert",
    color: "text-red-600 bg-red-500/10 border-red-500/20",
    audience: "Parents Only",
    message: `Dear Parent,\n\nThis is to inform you that your child's attendance at Dance Is Life Art & Study Center has dropped below 75%.\n\nRegular attendance is crucial for skill development. Please ensure your child attends classes regularly.\n\nFor any concerns, please reach out to us directly.\n\nThank you,\nDIL Academy`,
  },
  {
    id: "schedule_change",
    icon: Clock,
    label: "Schedule Change",
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
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
  const charColor = charPct > 90 ? "text-red-500" : charPct > 70 ? "text-amber-500" : "text-[var(--muted)]";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)] flex items-center gap-3 tracking-tight">
          <MessageSquare className="w-8 h-8 text-[var(--muted)]" /> Communication Hub
        </h1>
        <p className="text-[var(--muted)] text-sm mt-2 ml-11">Send announcements and bulk messages to students and parents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT — Compose + History */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-[var(--card)] p-1.5 rounded-2xl border border-[var(--border-color)] w-fit">
            {(["compose", "history"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="commTab"
                    className="absolute inset-0 bg-[var(--hover-bg)] border border-[var(--border-color)] shadow-sm rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "history" ? `History (${broadcasts.length})` : "Compose"}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Compose Tab */}
            {activeTab === "compose" && (
              <motion.div 
                key="compose"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8 space-y-8"
              >
                {/* Audience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[var(--muted)]" /> Target Audience
                  </label>
                  <div className="relative">
                    <select
                      value={audience}
                      onChange={(e: any) => setAudience(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] appearance-none transition-all"
                    >
                      <option>All Active Students</option>
                      <option>Junior A (Mon, Wed, Fri)</option>
                      <option>Senior B (Tue, Thu, Sat)</option>
                      <option>Weekend Pro (Sat, Sun)</option>
                      <option>Classical Beginners</option>
                      <option>Parents Only</option>
                      <option>Students with Pending Fees</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                  </div>
                </div>

                {/* Channels */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[var(--foreground)]">Delivery Channels</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={useWhatsApp} onChange={(e: any) => setUseWhatsApp(e.target.checked)} className="peer appearance-none w-5 h-5 border border-[var(--border-color)] rounded bg-[var(--card)] checked:bg-emerald-500 checked:border-emerald-500 transition-colors cursor-pointer" />
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-500" /> WhatsApp
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={useInApp} onChange={(e: any) => setUseInApp(e.target.checked)} className="peer appearance-none w-5 h-5 border border-[var(--border-color)] rounded bg-[var(--card)] checked:bg-[var(--foreground)] checked:border-[var(--foreground)] transition-colors cursor-pointer" />
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--background)] absolute pointer-events-none opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-[var(--foreground)]" /> In-App
                      </span>
                    </label>
                  </div>
                </div>

                {/* Message Textarea */}
                <form onSubmit={handleSend} className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)] flex items-center justify-between">
                      Message Content
                    </label>
                    <div className="relative">
                      <textarea
                        rows={8}
                        required
                        value={message}
                        onChange={(e: any) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                        placeholder="Type your announcement here, or pick a template on the right →"
                        className="w-full px-5 py-4 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] resize-none font-mono leading-relaxed transition-all placeholder:text-[var(--muted)]"
                      />
                    </div>
                    {/* Char counter */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="h-1.5 flex-1 bg-[var(--hover-bg)] rounded-full mr-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${charPct > 90 ? "bg-red-500" : charPct > 70 ? "bg-amber-500" : "bg-[var(--foreground)]"}`}
                          style={{ width: `${charPct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium tabular-nums ${charColor}`}>{message.length}/{MAX_CHARS}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSending || !message.trim()}
                      className="px-8 py-3.5 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center justify-center min-w-[180px] gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {isSending ? "Sending..." : "Send Broadcast"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-[var(--border-color)]">
                  <h2 className="font-semibold text-[var(--foreground)] text-lg">Sent Broadcasts</h2>
                </div>
                {isLoadingHistory ? (
                  <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" /></div>
                ) : broadcasts.length === 0 ? (
                  <div className="py-16 text-center text-[var(--muted)] space-y-3">
                    <MessageSquare className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-sm">No broadcasts sent yet. Compose your first message!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-color)]">
                    {broadcasts.map((b: any, i: any) => (
                      <div key={i} className="px-8 py-6 hover:bg-[var(--hover-bg)] transition-colors">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-[var(--hover-bg)] text-[var(--foreground)] flex items-center justify-center shrink-0 border border-[var(--border-color)] mt-0.5">
                              <BellRing className="w-5 h-5 opacity-70" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-medium text-[var(--foreground)] truncate">{b.audience}</p>
                              <p className="text-sm text-[var(--muted)] mt-1.5 line-clamp-2 leading-relaxed">{b.message}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-xs font-medium text-[var(--muted)]">{b.date}</span>
                                <span className="text-[var(--muted)] opacity-50">·</span>
                                <span className="text-xs bg-[var(--foreground)] text-[var(--background)] px-2.5 py-1 rounded-md font-medium">{b.channel}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-600 shrink-0 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Sent</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Templates */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6">
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--muted)]" /> Message Templates
            </h3>
            <p className="text-sm text-[var(--muted)] mb-6">Click any template to auto-fill the compose form.</p>
            <div className="space-y-3">
              {TEMPLATES.map(tpl => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => { applyTemplate(tpl); setActiveTab("compose"); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--hover-bg)] transition-all text-left group border border-[var(--border-color)] hover:border-[var(--foreground)]/20 shadow-sm hover:shadow-md"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${tpl.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{tpl.label}</p>
                      <p className="text-xs text-[var(--muted)] truncate max-w-[160px] mt-0.5">{tpl.audience}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Status */}
          <div className="bg-[var(--foreground)] rounded-3xl p-6 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[40px] opacity-20 translate-x-1/3 -translate-y-1/3" />
            <h3 className="font-semibold text-[var(--background)] mb-2 flex items-center gap-2 text-base">
              <Phone className="w-4 h-4 text-emerald-400" /> WhatsApp Ready
            </h3>
            <p className="text-sm text-[var(--background)]/70 mb-4 leading-relaxed">Messages open WhatsApp Web with your text pre-filled.</p>
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-full h-full bg-emerald-400 rounded-full animate-ping opacity-20" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
