"use client";

import { Settings, Image as ImageIcon, Shield, BellRing, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

import { updateAcademySettings, fetchAcademySettings } from "@/app/actions/settings";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General Profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAcademySettings().then(data => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-500" />
          Academy Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage your academy profile, billing, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-1">
          {tabs.map((item, i) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                {item.name}
              </button>
            )
          })}
        </div>

        {/* Settings Content Area */}
        {activeTab === "General Profile" && (
          <form onSubmit={handleSave} className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">General Profile</h2>

            {isLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Academy Name</label>
                  <input type="text" name="name" defaultValue={settings?.name || "Dance Is Life Art & Study Center"} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Email</label>
                    <input type="email" name="email" defaultValue={settings?.contact_email || "admin@danceislife.academy"} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Support Phone</label>
                    <input type="tel" name="phone" defaultValue={settings?.contact_phone || "+91 9876543210"} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Address</label>
                  <textarea rows={3} name="address" defaultValue={settings?.address || "456 Studio Lane, Arts District, Mumbai"} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200"></textarea>
                </div>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              {saved && (
                <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Settings saved successfully!
                </span>
              )}
              <button type="submit" disabled={isSaving} className="ml-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-70">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === "Branding & Logo" && (
          <form onSubmit={handleMockSave} className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">Branding & Logo</h2>
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload your academy logo</p>
                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (Max 2MB)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Brand Color Hex</label>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-600 border border-slate-200 dark:border-slate-700"></div>
                  <input type="text" defaultValue="#7C3AED" className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm text-sm flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Logo'}
              </button>
            </div>
          </form>
        )}

        {activeTab === "Roles & Security" && (
          <form onSubmit={handleMockSave} className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">Roles & Security</h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <p>Manage who has access to your academy dashboard.</p>
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Admin (You)</p>
                  <p className="text-xs">Full access to all modules</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">Active</span>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm text-sm flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Roles'}
              </button>
            </div>
          </form>
        )}

        {activeTab === "Notifications" && (
          <form onSubmit={handleMockSave} className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Email Alerts</p>
                  <p className="text-xs text-slate-500">Get notified when a new student joins</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-600" />
              </label>
              <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">WhatsApp Automation</p>
                  <p className="text-xs text-slate-500">Auto-send fee reminders to parents</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-600" />
              </label>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm text-sm flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
