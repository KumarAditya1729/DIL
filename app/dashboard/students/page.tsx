"use client";

import { Plus, Search, MoreHorizontal, CheckCircle2, XCircle, GraduationCap, ArrowUpDown, ChevronDown, Filter, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteStudent } from "@/app/actions/students";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Student = {
  id: string;
  admission_number: string;
  full_name: string;
  mobile_number: string;
  parent_name: string;
  dance_style: string;
  batch: string;
  gender: string;
  status: string;
  created_at: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const loadStudents = () => {
    const supabase = createClient();
    supabase
      .from("students")
      .select("*")
      .order("admission_number", { ascending: true })
      .then(({ data }) => {
        const list = data || [];
        setStudents(list);
        setFiltered(list);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const res = await deleteStudent(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Student deleted");
      loadStudents();
    }
  };

  useEffect(() => {
    let result = students;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        s => s.full_name?.toLowerCase().includes(q) || s.admission_number?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter);
    }
    setFiltered(result);
  }, [query, statusFilter, students]);

  const toggleRow = (id: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRows(newSet);
  };

  const toggleAll = () => {
    if (selectedRows.size === filtered.length && filtered.length > 0) {
      setSelectedRows(newSet => new Set());
    } else {
      setSelectedRows(new Set(filtered.map(s => s.id)));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Student Directory</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {loading ? "Loading directory..." : `${students.length} total students enrolled`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/students/new"
            className="px-5 py-2.5 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full font-semibold shadow-sm transition-all text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Student
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--card-bg)] p-2 rounded-2xl border border-[var(--border-color)]">
        
        {/* Filters */}
        <div className="flex bg-[var(--background)] p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar border border-[var(--border-color)]">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
            { id: "alumni", label: "Alumni" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs flex-shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search directory..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      {/* Bulk Actions Banner */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--foreground)] text-[var(--background)] p-3 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4 px-2">
              <span className="text-sm font-bold bg-[var(--background)] text-[var(--foreground)] px-2 py-0.5 rounded-md">{selectedRows.size}</span>
              <span className="text-sm font-medium">students selected</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors">Message</button>
              <button className="px-3 py-1.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors">Export</button>
              <button className="px-3 py-1.5 rounded-xl text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">Delete</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Data Grid */}
      <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 text-[var(--muted)]">
              <div className="w-8 h-8 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium">Loading directory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-[var(--muted)] flex flex-col items-center">
              <GraduationCap className="w-12 h-12 text-[var(--border-color)] mb-4" />
              <p className="font-semibold text-[var(--foreground)] text-lg">No students found.</p>
              <p className="text-sm mt-1">Adjust your filters or add a new student.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--muted)] bg-[var(--background)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-[var(--border-color)] text-[var(--foreground)] focus:ring-[var(--foreground)] bg-[var(--card-bg)]"
                      checked={selectedRows.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold tracking-wider flex items-center gap-1 cursor-pointer hover:text-[var(--foreground)]">STUDENT <ArrowUpDown className="w-3 h-3"/></th>
                  <th className="px-6 py-4 font-semibold tracking-wider">ADMISSION</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">BATCH</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">STATUS</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filtered.map((student) => {
                  const isSelected = selectedRows.has(student.id);
                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-[var(--background)] transition-colors group ${isSelected ? 'bg-[var(--background)]' : ''}`}
                    >
                      <td className="px-6 py-5">
                        <input 
                          type="checkbox" 
                          className="rounded border-[var(--border-color)] text-[var(--foreground)] focus:ring-[var(--foreground)] bg-[var(--card-bg)]"
                          checked={isSelected}
                          onChange={() => toggleRow(student.id)}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[var(--foreground)] flex items-center justify-center font-bold text-sm text-[var(--background)] shrink-0">
                            {student.full_name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <Link href={`/dashboard/students/${student.admission_number}`} className="font-semibold text-[var(--foreground)] hover:underline">
                              {student.full_name}
                            </Link>
                            <p className="text-xs text-[var(--muted)] font-medium mt-0.5">{student.parent_name ? `Parent: ${student.parent_name}` : student.mobile_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono font-medium text-[var(--muted)] text-xs bg-[var(--background)] px-2 py-1 rounded-md border border-[var(--border-color)]">
                          {student.admission_number || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[var(--foreground)] font-medium text-sm">{student.batch || "Unassigned"}</p>
                        <p className="text-xs text-[var(--muted)] font-medium mt-0.5">{student.dance_style || ""}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {student.status === "active" && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                            </span>
                          )}
                          {student.status !== "active" && (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[var(--background)] text-[var(--muted)] border border-[var(--border-color)]">
                              {student.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                            onClick={() => handleDelete(student.id, student.full_name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link 
                            href={`/dashboard/students/${student.admission_number}`}
                            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] border border-transparent hover:border-[var(--border-color)] rounded-xl transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
