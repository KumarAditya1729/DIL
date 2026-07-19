"use client";

import { Calendar, Plus, MapPin, Users, Music, X, Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchEvents, createEvent, uploadEventGallery } from "@/app/actions/events";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_COLORS: Record<string, string> = {
  'Main Event': 'bg-[var(--foreground)] text-[var(--background)]',
  'Workshop': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Competition': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Practice': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
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
    setEvents(data || []);
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Events & Media</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Plan showcases and manage event galleries.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full font-semibold shadow-sm transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" /></div>
      ) : events.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] flex flex-col items-center justify-center p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-[var(--background)] border border-[var(--border-color)] rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-[var(--muted)]" />
          </div>
          <h3 className="font-bold text-[var(--foreground)] text-lg">No events yet</h3>
          <p className="text-sm text-[var(--muted)] mt-1 mb-6">Click &quot;New Event&quot; to plan your first showcase.</p>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-medium hover:bg-[var(--foreground)]/90 shadow-sm transition-all">
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={event.id} 
              className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
            >
              {/* Event Cover Image */}
              <div className="h-48 relative overflow-hidden bg-[var(--background)]">
                {event.cover_image ? (
                  <Image src={event.cover_image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-[var(--muted)]" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-sm ${TYPE_COLORS[event.type] || TYPE_COLORS['Main Event']}`}>
                  {event.type}
                </span>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-xl leading-tight mb-1">{event.title}</h3>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm font-medium text-[var(--muted)]">
                    <Calendar className="w-4 h-4 mr-3" />
                    <span className="text-[var(--foreground)]">{new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span> {event.time && <span className="ml-1 opacity-50">• {event.time}</span>}
                  </div>
                  <div className="flex items-center text-sm font-medium text-[var(--muted)]">
                    <MapPin className="w-4 h-4 mr-3" />
                    <span className="text-[var(--foreground)] truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center text-sm font-medium text-[var(--muted)]">
                    <Users className="w-4 h-4 mr-3" />
                    <span className="text-[var(--foreground)]">{event.participants} Participants</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {(event.gallery || []).slice(0, 3).map((img, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full border-2 border-[var(--card-bg)] relative overflow-hidden bg-[var(--background)]">
                        <Image src={img} alt="Gallery" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                    {(event.gallery || []).length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--card-bg)] bg-[var(--background)] flex items-center justify-center text-[10px] font-bold text-[var(--foreground)] z-10">
                        +{(event.gallery || []).length - 3}
                      </div>
                    )}
                    {(event.gallery || []).length === 0 && (
                      <span className="text-xs text-[var(--muted)] font-medium">No photos</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => { setSelectedEvent(event); setIsGalleryOpen(true); }}
                    className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] hover:text-[var(--foreground)]/70 transition-colors"
                  >
                    Gallery &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Gallery Modal ─────────────────────────────── */}
      <AnimatePresence>
        {isGalleryOpen && selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--background)]/90 backdrop-blur-sm z-40"
              onClick={() => setIsGalleryOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[var(--card-bg)] rounded-[32px] shadow-2xl w-full max-w-5xl h-[85vh] border border-[var(--border-color)] flex flex-col overflow-hidden pointer-events-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[var(--border-color)] shrink-0 bg-[var(--background)]/50 backdrop-blur-md">
                  <div>
                    <h2 className="font-bold text-2xl text-[var(--foreground)] flex items-center gap-3 tracking-tight">
                      <ImageIcon className="w-6 h-6 text-[var(--muted)]" /> {selectedEvent.title}
                    </h2>
                    <p className="text-sm text-[var(--muted)] mt-1 font-medium">{(selectedEvent.gallery || []).length} photos uploaded</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleMockUpload} disabled={isUploading} className="px-5 py-2.5 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      {isUploading ? "Uploading..." : "Add Photos"}
                    </button>
                    <button onClick={() => setIsGalleryOpen(false)} className="p-2.5 rounded-full hover:bg-[var(--background)] transition-colors border border-transparent hover:border-[var(--border-color)]">
                      <X className="w-5 h-5 text-[var(--muted)] hover:text-[var(--foreground)]" />
                    </button>
                  </div>
                </div>
                
                {/* Grid */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[var(--background)]">
                  {(selectedEvent.gallery || []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--muted)]">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-semibold text-lg text-[var(--foreground)]">No photos yet</p>
                      <p className="text-sm mt-1 mb-6">Upload photos to share with students.</p>
                      <button onClick={handleMockUpload} disabled={isUploading} className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full text-sm font-semibold hover:bg-[var(--foreground)]/90 shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Upload Photos
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {(selectedEvent.gallery || []).map((img, idx) => (
                        <div key={idx} className="aspect-square relative rounded-[20px] overflow-hidden group border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
                          <Image src={img} alt="Gallery item" fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── Create Event Modal ───────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-40" 
              onClick={() => setShowModal(false)} 
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[var(--card-bg)] rounded-[32px] shadow-2xl w-full max-w-lg border border-[var(--border-color)] overflow-hidden pointer-events-auto"
              >
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[var(--border-color)]">
                  <h2 className="font-bold text-xl text-[var(--foreground)] tracking-tight">New Event</h2>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-[var(--background)] transition-all">
                    <X className="w-5 h-5 text-[var(--muted)] hover:text-[var(--foreground)]" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Event Title *</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Annual Showcase" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Description</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description..." className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Date *</label>
                      <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all appearance-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Time</label>
                      <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all appearance-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Venue *</label>
                    <input required value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} placeholder="e.g. City Auditorium" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Event Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all appearance-none">
                      <option>Main Event</option>
                      <option>Workshop</option>
                      <option>Competition</option>
                      <option>Practice</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-medium text-[var(--foreground)] hover:bg-[var(--background)] transition-all text-sm">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 shadow-sm transition-all hover:scale-[1.02]">
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isSaving ? 'Saving...' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
