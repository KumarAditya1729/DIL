"use client";

import { Calendar, Plus, MapPin, Users, Music, X, Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchEvents, createEvent, uploadEventGallery } from "@/app/actions/events";
import { toast } from "sonner";
import Image from "next/image";

const TYPE_COLORS: Record<string, string> = {
  'Main Event': 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  'Workshop': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Competition': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Practice': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

// Fallback images based on index
const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
];

type Event = { id: string; title: string; date: string; time: string; venue: string; type: string; participants: number; description: string; cover_image: string; gallery: string[] };

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Gallery state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({ title: '', date: '', time: '', venue: '', type: 'Main Event', description: '' });

  useEffect(() => { loadEvents(); }, []);

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
    formData.append("description", form.description);
    // Assign a random cool cover image just for demo purposes
    formData.append("cover_image", DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)]);

    const res = await createEvent(formData);
    
    if (res.error) toast.error(res.error);
    else {
       toast.success("Event created successfully");
       setForm({ title: '', date: '', time: '', venue: '', type: 'Main Event', description: '' });
       setShowModal(false);
       loadEvents();
    }
    setIsSaving(false);
  };

  const handleMockUpload = async () => {
    if (!selectedEvent) return;
    setIsUploading(true);
    // Simulate upload delay and add 2 random unsplash images
    setTimeout(async () => {
      const newImages = [
        `https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800&auto=format&fit=crop&sig=${Math.random()}`,
        `https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop&sig=${Math.random()}`
      ];
      
      const res = await uploadEventGallery(selectedEvent.id, newImages);
      setIsUploading(false);
      
      if (res.error) toast.error(res.error);
      else {
        toast.success("Photos added to gallery!");
        setSelectedEvent({ ...selectedEvent, gallery: [...(selectedEvent.gallery || []), ...newImages] });
        loadEvents(); // refresh background list
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Events &amp; Media</h1>
          <p className="text-slate-500 text-sm mt-1">Plan showcases, and manage event photo galleries.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-16 text-center">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">No events yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">Click "Create Event" to plan your first showcase.</p>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm">
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <div key={event.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all group">
              {/* Event Cover Image */}
              <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                {event.cover_image ? (
                  <Image src={event.cover_image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-300" /></div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <span className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-md bg-white/90 dark:bg-slate-900/90 ${TYPE_COLORS[event.type] || TYPE_COLORS['Main Event']}`}>
                  {event.type}
                </span>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-lg leading-tight mb-1">{event.title}</h3>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="space-y-3 mb-5">
                  <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 mr-2.5 text-slate-400" />
                    {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} {event.time && `• ${event.time}`}
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 mr-2.5 text-slate-400" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Users className="w-4 h-4 mr-2.5 text-slate-400" />
                    {event.participants} Participants Enrolled
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {/* Mock gallery previews */}
                    {(event.gallery || []).slice(0, 3).map((img, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 relative overflow-hidden bg-slate-200">
                        <Image src={img} alt="Gallery" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                    {(event.gallery || []).length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 z-10">
                        +{(event.gallery || []).length - 3}
                      </div>
                    )}
                    {(event.gallery || []).length === 0 && (
                      <span className="text-xs text-slate-400">No photos yet</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { setSelectedEvent(event); setIsGalleryOpen(true); }}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Gallery
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Gallery Modal ─────────────────────────────── */}
      {isGalleryOpen && selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary-500" /> {selectedEvent.title} Gallery
                </h2>
                <p className="text-sm text-slate-500 mt-1">{(selectedEvent.gallery || []).length} photos uploaded</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleMockUpload} disabled={isUploading} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {isUploading ? "Uploading..." : "Add Photos"}
                </button>
                <button onClick={() => setIsGalleryOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-slate-50 dark:bg-slate-800/50">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            {/* Grid */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
              {(selectedEvent.gallery || []).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No photos in this gallery</p>
                  <p className="text-sm mt-1 mb-6">Upload photos from the event to share with students.</p>
                  <button onClick={handleMockUpload} disabled={isUploading} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-sm flex items-center gap-2 disabled:opacity-50">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Upload Photos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(selectedEvent.gallery || []).map((img, idx) => (
                    <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden group border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 shadow-sm">
                      <Image src={img} alt="Gallery item" fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create Event Modal ───────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Create New Event</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Title <span className="text-red-500">*</span></label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Annual Dance Showcase 2026" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description of the event..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date <span className="text-red-500">*</span></label>
                  <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Venue <span className="text-red-500">*</span></label>
                <input required value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="e.g. City Auditorium" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white appearance-none">
                  <option>Main Event</option>
                  <option>Workshop</option>
                  <option>Competition</option>
                  <option>Practice</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2 disabled:opacity-70 shadow-sm transition-colors">
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
