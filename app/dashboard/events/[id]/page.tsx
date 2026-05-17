"use client";

import { ArrowLeft, Users, Calendar, MapPin, DollarSign, Activity, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview");

  const event = {
    title: "Annual Dance Showcase 2026",
    status: "Planning",
    date: "24 Jun 2026",
    time: "06:00 PM",
    venue: "City Auditorium, Downtown",
    budget: "₹1,50,000",
    revenue: "₹45,000"
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{event.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.venue}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg font-medium transition-colors text-sm">
            Publish Event
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {["overview", "participants", "costumes", "rehearsals", "financials"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-all capitalize border-b-2 whitespace-nowrap ${
                activeTab === tab 
                ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Event Description</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                The biggest annual gathering of Rhythm & Soul Dance Academy. This event will showcase over 120 students across various styles including Hip Hop, Classical, and Contemporary. The show is expected to run for 3 hours with a 20-minute intermission.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Registered Participants</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">120</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <div className="w-10 h-10 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-500">Ticket Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹45,000</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Timeline</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5 z-10 border-2 border-white dark:border-slate-900"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Planning Started</p>
                    <p className="text-xs text-slate-500">01 May 2026</p>
                  </div>
                </div>
                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mt-0.5 z-10 border-2 border-white dark:border-slate-900"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Costume Deadline</p>
                    <p className="text-xs text-slate-500">10 Jun 2026</p>
                  </div>
                </div>
                <div className="relative flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 z-10 border-2 border-white dark:border-slate-900"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Full Dress Rehearsal</p>
                    <p className="text-xs text-slate-500">22 Jun 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "participants" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <p className="text-sm text-slate-500">Participant registration logic and table will be rendered here...</p>
        </div>
      )}
      
      {activeTab === "costumes" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <p className="text-sm text-slate-500">Costume assignment and vendor tracking UI here...</p>
        </div>
      )}
    </div>
  );
}
