"use client";

import { Archive, Search, History, Trophy, Upload, Download, RefreshCw, Loader2, ArrowUpRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fetchAlumni, restoreStudent } from "@/app/actions/students";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Alumni & History
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">Manage inactive students and import historical academy records.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90 rounded-full font-semibold shadow-sm transition-all text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-[32px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col min-h-[60vh]">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--foreground)]/5 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, or style..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] outline-none text-sm font-medium transition-all"
            />
          </div>
          <button className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[var(--background)] border border-transparent hover:border-[var(--border-color)] transition-all">
            <Download className="w-4 h-4" /> CSV Template
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex flex-col justify-center items-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)] mb-4" />
            <p className="text-sm font-medium text-[var(--muted)]">Loading alumni records...</p>
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 rounded-2xl bg-[var(--background)] border border-[var(--border-color)] shadow-sm flex items-center justify-center mb-6">
              <Archive className="w-6 h-6 text-[var(--muted)]" />
            </div>
            <p className="text-lg font-bold text-[var(--foreground)]">No records found</p>
            <p className="text-sm mt-2 font-medium text-[var(--muted)]">No inactive students match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {filteredAlumni.map((student, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={i} 
                className="flex flex-col sm:flex-row gap-5 p-6 rounded-[24px] border border-[var(--border-color)] bg-[var(--background)] hover:border-[var(--foreground)]/30 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="w-14 h-14 rounded-[16px] bg-[var(--foreground)]/5 border border-[var(--border-color)] flex items-center justify-center shrink-0 text-[var(--foreground)]">
                  <History className="w-6 h-6 opacity-70" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/dashboard/students/${student.id}`} className="font-bold text-lg text-[var(--foreground)] truncate flex items-center gap-1.5 group/link">
                        {student.name} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity text-[var(--muted)]" />
                      </Link>
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-[var(--foreground)] text-[var(--background)] px-2.5 py-1 rounded-full whitespace-nowrap">
                        {student.years}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--muted)]">{student.id} <span className="mx-2 opacity-30">•</span> {student.style || 'General'}</p>
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit border border-amber-500/20">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{student.achievements}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleRestore(student.id, student.name)}
                      disabled={restoringId === student.id}
                      className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--background)] bg-[var(--background)] hover:bg-[var(--foreground)] border border-[var(--border-color)] px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      {restoringId === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Restore Active
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
