"use client";

import { Archive, Search, History, Trophy, Upload, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const toast = { success: (msg: string) => alert(msg), error: (msg: string) => alert(msg), info: (msg: string) => alert(msg) };

// Real CSV parser using native browser FileReader + manual CSV parsing
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {} as Record<string, string>);
  });
}

import { fetchAlumni } from "@/app/actions/students";

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([]);

  useEffect(() => {
    fetchAlumni().then(setAlumni);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info("Parsing CSV file...");
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      const newData = rows.map((row) => ({
        id: row.id || `DA-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 100)}`,
        name: row.name || "Unknown",
        years: row.years || "Unknown",
        style: row.style || "Unknown",
        achievements: row.achievements || "None",
      }));
      setAlumni((prev) => [...newData, ...prev]);
      toast.success(`Successfully imported ${newData.length} historical records!`);
    };
    reader.onerror = () => toast.error("Error reading file.");
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary-600" />
            Alumni & Past Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">Access historical student data since 2014.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none">
            <option>All Years</option>
            <option>2023</option>
            <option>2022</option>
            <option>2021</option>
            <option>2014-2020</option>
          </select>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg font-medium shadow-sm transition-all text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Import CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center flex-wrap gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, year, or ID..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200"
            />
          </div>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Sample Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 p-4 sm:p-6">
          {alumni.map((student, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800/50 transition-colors bg-white dark:bg-slate-800/50">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500">
                <History className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{student.name}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2 py-1 rounded-md whitespace-nowrap">
                    {student.years}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{student.id} • {student.style}</p>
                <div className="mt-3 flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                  <Trophy className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{student.achievements}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
