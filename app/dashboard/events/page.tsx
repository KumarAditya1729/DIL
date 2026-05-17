"use client";

import { Calendar, Plus, MapPin, Users, Music, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchEvents, createEvent } from "@/app/actions/events";
import { toast } from "sonner";

const COLORS = ['bg-primary-500', 'bg-amber-500', 'bg-purple-500', 'bg-green-500', 'bg-rose-500'];
const TYPE_COLORS: Record<string, string> = {
  'Main Event': 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  'Workshop': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Competition': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Practice': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

type Event = { title: string; date: string; time: string; venue: string; type: string; participants: number };

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '', type: 'Main Event' });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const data = await fetchEvents();
    setEvents(data);
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return;
    setIsSaving(true);
    
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("date", form.date);
    formData.append("time", form.time);
    formData.append("venue", form.venue);
    formData.append("type", form.type);

    const res = await createEvent(formData);
    
    if (res.error) {
       toast.error(res.error);
    } else {
       toast.success("Event created successfully");
       setForm({ title: '', date: '', time: '', venue: '', type: 'Main Event' });
       setShowModal(false);
       loadEvents();
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Events & Performances</h1>
          <p className="text-slate-500 text-sm mt-1">Plan showcases, workshops, and competitions.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-primary-500" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">No events yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Click &quot;Create Event&quot; to plan your first showcase or workshop.</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
              <div className={`h-2 ${COLORS[i % COLORS.length]}`}></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${TYPE_COLORS[event.type] || TYPE_COLORS['Main Event']}`}>
                    {event.type}
                  </span>
                  <Music className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">{event.title}</h3>
                <div className="space-y-2 mt-auto pt-4">
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} {event.time && `• ${event.time}`}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {event.venue}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Users className="w-4 h-4 mr-2 text-slate-400" />
                    {event.participants} Participants
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div
            onClick={() => setShowModal(true)}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[200px]"
          >
            <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-slate-900 dark:text-white">Plan New Event</h3>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Create New Event</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Title *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Annual Dance Showcase 2026" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date *</label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Venue *</label>
                <input required value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="e.g. City Auditorium" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-slate-200">
                  <option>Main Event</option>
                  <option>Workshop</option>
                  <option>Competition</option>
                  <option>Practice</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 rounded-xl text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 disabled:opacity-70">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

