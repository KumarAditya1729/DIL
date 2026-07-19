"use client";

import { Settings, Image as ImageIcon, Shield, BellRing, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { updateAcademySettings, fetchAcademySettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { getUserRole } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General Profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getUserRole().then(role => {
      if (role === 'teacher') {
        setHasAccess(false);
        router.push('/dashboard');
      } else {
        fetchAcademySettings().then(data => {
          setSettings(data);
          setIsLoading(false);
        });
      }
    });
  }, [router]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--muted)]">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-[var(--foreground)]">Access Denied</h2>
        <p className="mt-2 text-sm">You do not have permission to view Global Settings.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateAcademySettings(formData);

    setIsSaving(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Settings saved successfully!");
    }
  };

  const handleMockSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`${activeTab} preferences saved!`);
    }, 1000);
  };

  const tabs = [
    { name: "General Profile", icon: Building2 },
    { name: "Branding & Logo", icon: ImageIcon },
    { name: "Roles & Security", icon: Shield },
    { name: "Notifications", icon: BellRing },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)] flex items-center gap-3 tracking-tight">
          <Settings className="w-8 h-8 text-[var(--muted)]" />
          Academy Settings
        </h1>
        <p className="text-[var(--muted)] text-sm mt-2 ml-11">Manage your academy profile, branding, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Settings Navigation */}
        <div className="md:col-span-4 lg:col-span-3 space-y-2">
          {tabs.map((item, i) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all relative overflow-hidden ${isActive
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)]'
                  }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabSetting"
                    className="absolute inset-0 bg-[var(--card)] border border-[var(--border-color)] shadow-sm rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--foreground)]' : 'opacity-70'}`} />
                  {item.name}
                </div>
              </button>
            )
          })}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-8 lg:col-span-9 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "General Profile" && (
              <motion.form 
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSave} 
                className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8 space-y-8"
              >
                <div className="border-b border-[var(--border-color)] pb-6">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">General Profile</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">Basic information about your academy.</p>
                </div>

                {isLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" /></div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]">Academy Name</label>
                      <input type="text" name="name" defaultValue={settings?.name || "Dance Is Life Art & Study Center"} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Contact Email</label>
                        <input type="email" name="email" defaultValue={settings?.contact_email || "admin@danceislife.academy"} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Support Phone</label>
                        <input type="tel" name="phone" defaultValue={settings?.contact_phone || "+91 9876543210"} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]">Primary Address</label>
                      <textarea rows={3} name="address" defaultValue={settings?.address || "456 Studio Lane, Arts District, Mumbai"} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all resize-none placeholder:text-[var(--muted)]"></textarea>
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-8 border-t border-[var(--border-color)] flex justify-between items-center">
                  <div>
                    {saved && (
                      <span className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Settings saved successfully
                      </span>
                    )}
                  </div>
                  <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === "Branding & Logo" && (
              <motion.form 
                key="branding"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleMockSave} 
                className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8 space-y-8"
              >
                <div className="border-b border-[var(--border-color)] pb-6">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">Branding & Logo</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">Customize the appearance of your academy OS.</p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-[var(--foreground)]">Academy Logo</label>
                    <div className="p-12 border-2 border-dashed border-[var(--border-color)] rounded-2xl text-center cursor-pointer hover:bg-[var(--hover-bg)] transition-colors group">
                      <div className="w-16 h-16 rounded-full bg-[var(--hover-bg)] group-hover:bg-[var(--border-color)] transition-colors mx-auto flex items-center justify-center mb-4">
                        <ImageIcon className="w-6 h-6 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
                      </div>
                      <p className="text-sm text-[var(--foreground)] font-medium">Click to upload your academy logo</p>
                      <p className="text-xs text-[var(--muted)] mt-1">SVG, PNG, JPG (Max 2MB)</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-[var(--foreground)]">Brand Color</label>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--foreground)] shadow-sm border border-[var(--border-color)]"></div>
                      <input type="text" defaultValue="#111111" className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all font-mono" />
                    </div>
                  </div>
                </div>
                <div className="pt-6 mt-8 border-t border-[var(--border-color)] flex justify-end">
                  <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? 'Saving...' : 'Save Branding'}
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === "Roles & Security" && (
              <motion.form 
                key="roles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleMockSave} 
                className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8 space-y-8"
              >
                <div className="border-b border-[var(--border-color)] pb-6">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">Roles & Security</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">Manage who has access to your academy dashboard.</p>
                </div>
                <div className="space-y-4">
                  <div className="p-5 border border-[var(--border-color)] rounded-2xl bg-[var(--hover-bg)]/50 flex justify-between items-center transition-colors hover:bg-[var(--hover-bg)]">
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">Admin (You)</p>
                      <p className="text-sm text-[var(--muted)] mt-0.5">Full access to all modules</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-semibold uppercase tracking-wider">Active</span>
                  </div>
                </div>
                <div className="pt-6 mt-8 border-t border-[var(--border-color)] flex justify-end">
                  <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? 'Saving...' : 'Save Roles'}
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === "Notifications" && (
              <motion.form 
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleMockSave} 
                className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8 space-y-8"
              >
                <div className="border-b border-[var(--border-color)] pb-6">
                  <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">Notification Preferences</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">Control how you receive updates and alerts.</p>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-5 border border-[var(--border-color)] rounded-2xl cursor-pointer hover:bg-[var(--hover-bg)] transition-colors">
                    <div>
                      <p className="font-semibold text-[var(--foreground)] text-sm">Email Alerts</p>
                      <p className="text-sm text-[var(--muted)] mt-0.5">Get notified when a new student joins</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[var(--foreground)] rounded border-[var(--border-color)]" />
                  </label>
                  <label className="flex items-center justify-between p-5 border border-[var(--border-color)] rounded-2xl cursor-pointer hover:bg-[var(--hover-bg)] transition-colors">
                    <div>
                      <p className="font-semibold text-[var(--foreground)] text-sm">WhatsApp Automation</p>
                      <p className="text-sm text-[var(--muted)] mt-0.5">Auto-send fee reminders to parents</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[var(--foreground)] rounded border-[var(--border-color)]" />
                  </label>
                </div>
                <div className="pt-6 mt-8 border-t border-[var(--border-color)] flex justify-end">
                  <button type="submit" disabled={isSaving} className="px-8 py-3 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
