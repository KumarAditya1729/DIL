"use client";

import { Archive, Search, History, Trophy, Upload, Download, RefreshCw, Loader2, ArrowUpRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fetchAlumni, restoreStudent } from "@/app/actions/students";
import { toast } from "sonner";
import Link from "next/link";

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

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAlumni();
    setAlumni(data);
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      const newData = rows.map((row) => ({
        id: row.id || `DA-${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 100)}`,
        name: row.name || "Unknown",
        years: row.years || "Unknown",
        style: row.style || "Unknown",
        achievements: row.achievements || "Academy Alumnus",
      }));
      setAlumni((prev) => [...newData, ...prev]);
      toast.success(`Successfully imported ${newData.length} historical records!`);
    };
    reader.onerror = () => toast.error("Error reading file.");
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Restore ${name} back to Active status? They will appear in the main Students list again.`)) return;
    
    setRestoringId(id);
    const res = await restoreStudent(id);
    setRestoringId(null);
    
    if (res.error) toast.error(res.error);
    else {
      toast.success(`${name} has been restored to Active status!`);
      loadData();
    }
  };

  const filteredAlumni = alumni.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary-600" />
            Alumni & Past Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage inactive students and historical academy records.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[60vh]">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center flex-wrap gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, or style..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200 transition-shadow"
            />
          </div>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Template
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 text-center">
            <Archive className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-slate-500">No records found</p>
            <p className="text-sm mt-1">There are no inactive students matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5 p-5">
            {filteredAlumni.map((student, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-primary-200 dark:hover:border-primary-800/50 transition-all hover:shadow-md group">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500">
                  <History className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <Link href={`/dashboard/students/${student.id}`} className="font-bold text-lg text-slate-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1.5">
                        {student.name} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md whitespace-nowrap">
                        {student.years}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{student.id} <span className="mx-1.5 opacity-50">•</span> {student.style || 'General'}</p>
                  </div>
                  
                  <div className="mt-4 flex items-end justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg w-fit">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{student.achievements}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleRestore(student.id, student.name)}
                      disabled={restoringId === student.id}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {restoringId === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Restore Active
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
