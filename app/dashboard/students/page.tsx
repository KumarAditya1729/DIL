"use client";

import { Plus, Search, Filter, Edit, Trash2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteStudent } from "@/app/actions/students";
import { toast } from "sonner";

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
    if (!confirm(`Are you sure you want to delete the student "${name}"?`)) return;
    const res = await deleteStudent(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Student deleted successfully");
      loadStudents();
    }
  };

  useEffect(() => {
    let result = students;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        s =>
          s.full_name?.toLowerCase().includes(q) ||
          s.admission_number?.toLowerCase().includes(q) ||
          s.mobile_number?.includes(q) ||
          s.batch?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter);
    }
    setFiltered(result);
  }, [query, statusFilter, students]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? "s" : ""} enrolled`}
          </p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all text-sm flex items-center justify-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          New Admission
        </Link>
      </div>

      {/* Segmented Quick Filter Status Tabs */}
      <div className="flex flex-wrap gap-2 pt-2">
        {[
          { id: "all", label: "All Students", count: students.length },
          { id: "active", label: "Active Students", count: students.filter(s => s.status === "active").length, color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
          { id: "inactive", label: "Inactive Students", count: students.filter(s => s.status === "inactive").length, color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
          { id: "alumni", label: "Alumni Students", count: students.filter(s => s.status === "alumni").length, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" }
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-md scale-105"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive 
                  ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950" 
                  : tab.color ? tab.color : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex gap-3 items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, ID, mobile, or batch..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Loading students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 flex flex-col items-center">
              <GraduationCap className="w-12 h-12 text-slate-300 mb-4" />
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {query || statusFilter !== "all" ? "No students match your search." : "No students enrolled yet."}
              </p>
              {!query && statusFilter === "all" && (
                <Link href="/dashboard/students/new" className="mt-3 text-primary-600 text-sm font-medium hover:underline">
                  + Add your first student
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Admission No.</th>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Mobile</th>
                  <th className="px-6 py-4 font-medium">Batch / Course</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    {/* Admission Number — prominent */}
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-lg text-xs tracking-wider">
                        {student.admission_number || "—"}
                      </span>
                    </td>
                    {/* Student Name & Parent */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                          {student.full_name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{student.full_name}</p>
                          <p className="text-xs text-slate-400">{student.parent_name ? `Parent: ${student.parent_name}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{student.mobile_number}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 dark:text-slate-300 font-medium">{student.batch || "Not assigned"}</p>
                      <p className="text-xs text-slate-400">{student.dance_style || ""}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        student.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : student.status === "alumni"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {student.status === "active" ? "Active" : student.status === "alumni" ? "Alumni" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={"/dashboard/students/" + student.admission_number} title="Edit student" className="p-1.5 text-slate-400 hover:text-primary-600 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(student.id, student.full_name)} title="Remove student" className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filtered.length} of {students.length} students</span>
            {query && (
              <button onClick={() => setQuery("")} className="text-primary-600 hover:underline font-medium">
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
