"use client";

import { Settings, Image as ImageIcon, Shield, BellRing, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

import { updateAcademySettings, fetchAcademySettings } from "@/app/actions/settings";
import { toast } from "sonner";

export default function SettingsPage() {
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
          {[
            { name: "General Profile", icon: Building2, active: true },
            { name: "Branding & Logo", icon: ImageIcon, active: false },
            { name: "Roles & Security", icon: Shield, active: false },
            { name: "Notifications", icon: BellRing, active: false },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active 
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
              }`}>
                <Icon className={`w-4 h-4 ${item.active ? 'text-primary-600' : 'text-slate-400'}`} />
                {item.name}
              </button>
            )
          })}
        </div>

        {/* Settings Content Area */}
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
      </div>
    </div>
  );
}
