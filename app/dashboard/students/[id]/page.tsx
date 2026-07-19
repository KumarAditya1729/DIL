"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Edit, Printer, Send, Activity, BookOpen, 
  AlertTriangle, Loader2, X, Save, CheckCircle2, Plus, 
  Receipt, Calendar, MapPin, Phone
} from "lucide-react";
import { fetchStudentDetails, updateStudent, addProgressNote, fetchStudentAttendanceHistory } from "@/app/actions/students";
import { fetchBatches } from "@/app/actions/batches";
import { toast } from "sonner";

type StudentProfile = {
  id: string;
  name: string;
  dob: string;
  gender: string;
  joinDate: string;
  status: string;
  styles: string[];
  batches: string[];
  parent: { name: string; phone: string; email: string; whatsapp?: string };
  address: string;
  aadhar: { name: string; number: string };
  medical: string;
  attendance: string;
  attendancePct: number;
  totalClasses: number;
  presentCount: number;
  feeStatus: string;
  dbId: string;
  progress: { date: string; note: string }[];
};

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "billing">("overview");
  const [attendanceHistory, setAttendanceHistory] = useState<{date: string, status: string, batch: string, notes: string}[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  const loadStudent = () => {
    setIsLoading(true);
    fetchStudentDetails(params.id).then(async data => {
      setStudent(data);
      if (data?.dbId) {
        const history = await fetchStudentAttendanceHistory(data.dbId);
        setAttendanceHistory(history);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => { 
    loadStudent(); 
    fetchBatches().then(setBatches).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateStudent(params.id, formData);
    setIsSaving(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Student profile updated successfully!");
      setIsEditOpen(false);
      loadStudent();
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsSavingNote(true);
    const res = await addProgressNote(params.id, note);
    setIsSavingNote(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Progress note added!");
      setNote("");
      setNoteOpen(false);
      loadStudent();
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-[var(--muted)] gap-4">
        <AlertTriangle className="w-12 h-12 opacity-50" />
        <p>Student not found.</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "billing", label: "Billing" },
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/students" className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors text-[var(--muted)] hover:text-[var(--foreground)]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">{student.name}</h1>
            <p className="text-[var(--muted)] text-sm mt-1 flex items-center gap-2">
              <span className="font-mono text-xs bg-[var(--hover-bg)] px-2 py-0.5 rounded-md">{student.id}</span>
              &middot;
              <span>Joined {student.joinDate}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] hover:bg-[var(--hover-bg)] text-[var(--foreground)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
            <Printer className="w-4 h-4 text-[var(--muted)]" />
            <span className="hidden sm:inline">Print ID</span>
          </button>
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-md transition-all text-sm flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - ID Card & Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            layoutId={`student-card-${student.id}`}
            className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden relative"
          >
            <div className="h-32 bg-[var(--hover-bg)] border-b border-[var(--border-color)] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--foreground)] opacity-[0.02]" />
              <div className="absolute -bottom-10 -right-10 opacity-5">
                <BookOpen className="w-48 h-48 text-[var(--foreground)]" />
              </div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-[var(--card)] bg-[var(--hover-bg)] absolute -top-10 flex items-center justify-center text-2xl font-medium text-[var(--foreground)] shadow-sm overflow-hidden">
                {student.name.charAt(0)}
              </div>
              <div className="mt-14 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-medium text-[var(--foreground)]">{student.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {student.styles.map((style, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-md bg-[var(--hover-bg)] text-[var(--muted)]">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  student.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 
                  student.status === 'alumni' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 
                  'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    student.status === 'active' ? 'bg-emerald-500' : 
                    student.status === 'alumni' ? 'bg-purple-500' : 'bg-amber-500'
                  }`} />
                  {student.status}
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <Activity className="w-4 h-4" /> Attendance
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{student.attendancePct}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <Receipt className="w-4 h-4" /> Fee Status
                  </div>
                  <span className={`font-medium ${student.feeStatus.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {student.feeStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <Calendar className="w-4 h-4" /> Batches
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{student.batches.length} Assigned</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Quick Card */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--hover-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[var(--muted)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{student.parent.name}</p>
                  <p className="text-sm text-[var(--muted)]">{student.parent.phone}</p>
                </div>
                <a href={`https://wa.me/${(student.parent.whatsapp || student.parent.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="ml-auto p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-xl transition-colors">
                  <Send className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--hover-bg)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[var(--muted)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{student.address !== 'N/A' ? student.address : 'No address provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          {student.medical && student.medical !== 'No medical conditions reported.' && (
            <div className="bg-amber-500/10 rounded-3xl border border-amber-500/20 p-6">
              <h3 className="text-sm font-medium text-amber-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> Medical Alert
              </h3>
              <p className="text-sm text-amber-600 leading-relaxed">{student.medical}</p>
            </div>
          )}
        </div>

        {/* Right Column - Main Content area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Custom Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[var(--card)] rounded-2xl border border-[var(--border-color)] w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-5 py-2 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === tab.id ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[var(--hover-bg)] rounded-xl border border-[var(--border-color)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8">
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5">Date of Birth</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{student.dob}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5">Gender</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{student.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5">Aadhar Card Holder</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{student.aadhar.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5">Aadhar Number</p>
                        <p className="text-sm font-mono text-[var(--foreground)]">{student.aadhar.number}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1.5">Email Address</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{student.parent.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-[var(--foreground)]">Attendance Snapshot</h3>
                      <Link href={`/dashboard/batches`} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                        View Batches
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-[var(--hover-bg)] border border-[var(--border-color)]">
                        <p className="text-xs text-[var(--muted)] mb-1">Total Classes</p>
                        <p className="text-2xl font-semibold text-[var(--foreground)]">{student.totalClasses}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-xs text-emerald-600 mb-1">Present</p>
                        <p className="text-2xl font-semibold text-emerald-600">{student.presentCount}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <p className="text-xs text-amber-600 mb-1">Absent</p>
                        <p className="text-2xl font-semibold text-amber-600">{student.totalClasses - student.presentCount}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TIMELINE TAB */}
              {activeTab === "timeline" && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-medium text-[var(--foreground)]">Progress Timeline</h3>
                    <button 
                      onClick={() => setNoteOpen(true)} 
                      className="flex items-center gap-1.5 text-sm font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Update
                    </button>
                  </div>

                  <AnimatePresence>
                    {noteOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-2xl space-y-4">
                          <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={3}
                            placeholder="Write a progress update..."
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)] transition-all resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setNoteOpen(false)} className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors font-medium">Cancel</button>
                            <button onClick={handleAddNote} disabled={isSavingNote || !note.trim()} className="px-4 py-2 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] text-sm font-medium rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm">
                              {isSavingNote && <Loader2 className="w-4 h-4 animate-spin" />} Post Update
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {student.progress.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--hover-bg)] flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[var(--muted)]" />
                      </div>
                      <p className="text-sm text-[var(--muted)]">No progress updates yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px before:h-full before:w-[2px] before:bg-[var(--border-color)]">
                      {student.progress.map((prog, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i} 
                          className="relative flex items-start gap-6 pl-14"
                        >
                          <div className="absolute left-0 w-10 h-10 rounded-full border-4 border-[var(--card)] bg-[var(--hover-bg)] flex items-center justify-center z-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--foreground)]" />
                          </div>
                          <div className="flex-1 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--card)] shadow-sm hover:shadow-md transition-shadow">
                            <time className="text-xs font-mono text-[var(--muted)] mb-2 block">{prog.date}</time>
                            <p className="text-sm text-[var(--foreground)] leading-relaxed">{prog.note}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* BILLING TAB */}
              {activeTab === "billing" && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-[var(--foreground)]">Current Balance</h3>
                      <p className="text-[var(--muted)] text-sm mt-1">Status of the current billing cycle.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-semibold ${student.feeStatus.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-[var(--foreground)]'}`}>
                          {student.feeStatus.toLowerCase() === 'paid' ? '₹0.00' : '₹2,500.00'}
                        </p>
                        <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mt-1">{student.feeStatus}</p>
                      </div>
                      <button className="h-12 px-6 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                        Record Payment
                      </button>
                    </div>
                  </div>

                  {/* Mock Invoice History */}
                  <div className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-[var(--border-color)]">
                      <h3 className="text-lg font-medium text-[var(--foreground)]">Payment History</h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[var(--hover-bg)]/50">
                          <tr>
                            <th className="px-8 py-4 font-medium text-[var(--muted)] w-1/4">Invoice</th>
                            <th className="px-8 py-4 font-medium text-[var(--muted)] w-1/4">Date</th>
                            <th className="px-8 py-4 font-medium text-[var(--muted)] w-1/4">Amount</th>
                            <th className="px-8 py-4 font-medium text-[var(--muted)] w-1/4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {/* MOCK DATA FOR DESIGN */}
                          <tr className="hover:bg-[var(--hover-bg)] transition-colors">
                            <td className="px-8 py-4 font-mono text-[var(--muted)]">INV-2023-08</td>
                            <td className="px-8 py-4 text-[var(--foreground)]">Aug 1, 2023</td>
                            <td className="px-8 py-4 font-medium text-[var(--foreground)]">₹2,500.00</td>
                            <td className="px-8 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Paid</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-[var(--hover-bg)] transition-colors">
                            <td className="px-8 py-4 font-mono text-[var(--muted)]">INV-2023-07</td>
                            <td className="px-8 py-4 text-[var(--foreground)]">Jul 1, 2023</td>
                            <td className="px-8 py-4 font-medium text-[var(--foreground)]">₹2,500.00</td>
                            <td className="px-8 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Paid</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Edit Drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {isEditOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
              onClick={() => setIsEditOpen(false)} 
            />

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--background)] shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)]">
                <div>
                  <h2 className="text-xl font-medium text-[var(--foreground)]">Edit Profile</h2>
                  <p className="text-sm text-[var(--muted)] mt-1">{student.id}</p>
                </div>
                <button 
                  onClick={() => setIsEditOpen(false)} 
                  className="p-2 rounded-full hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted)] hover:text-[var(--foreground)]" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Full Name <span className="text-red-500">*</span></label>
                    <input name="fullName" required defaultValue={student.name} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Mobile Number <span className="text-red-500">*</span></label>
                    <input name="mobileNumber" required defaultValue={student.parent.phone} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">WhatsApp Number</label>
                    <input name="whatsappNumber" defaultValue={student.parent.whatsapp || ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)]" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                    <input name="email" type="email" defaultValue={student.parent.email !== 'N/A' ? student.parent.email : ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)]" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Parent / Guardian Name</label>
                    <input name="parentName" defaultValue={student.parent.name !== 'N/A' ? student.parent.name : ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Aadhar Name</label>
                    <input name="aadharName" defaultValue={student.aadhar.name !== 'N/A' ? student.aadhar.name : ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Aadhar Number</label>
                    <input name="aadharNumber" type="text" inputMode="numeric" pattern="[0-9]{12}" maxLength={12} defaultValue={student.aadhar.number !== 'N/A' ? student.aadhar.number : ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)]" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Address</label>
                    <textarea name="address" rows={2} defaultValue={student.address !== 'N/A' ? student.address : ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all resize-none text-[var(--foreground)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Date of Birth</label>
                    <input name="dob" type="date" defaultValue={student.dob} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)] [color-scheme:light] dark:[color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Gender</label>
                    <select name="gender" defaultValue={student.gender !== 'N/A' ? student.gender : ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)] appearance-none">
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Courses</label>
                    <select name="danceStyle" defaultValue={student.styles[0] || ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)] appearance-none">
                      <option value="">Select Course</option>
                      <option>Dance</option><option>Music</option><option>Art Zone</option><option>Kathak</option><option>Martial Arts</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Batch</label>
                    <select name="batch" defaultValue={student.batches[0] || ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)] appearance-none">
                      <option value="">Select Batch</option>
                      {batches.length === 0 ? (
                        <option disabled value="">⚠️ No batches available</option>
                      ) : (
                        batches.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name} ({b.style})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Status</label>
                    <select name="status" defaultValue={student.status} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all text-[var(--foreground)] appearance-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]">Medical Notes</label>
                    <textarea name="medicalNotes" rows={3} defaultValue={student.medical !== 'No medical conditions reported.' ? student.medical : ''} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm transition-all resize-none text-[var(--foreground)]" />
                  </div>
                </div>
              </form>

              <div className="px-8 py-6 border-t border-[var(--border-color)] bg-[var(--hover-bg)] flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-3 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border-color)] transition-colors">
                  Cancel
                </button>
                <button
                  form=""
                  onClick={(e) => {
                    const form = (e.currentTarget as HTMLElement).closest('.fixed')?.querySelector('form');
                    form?.requestSubmit();
                  }}
                  disabled={isSaving}
                  className="px-6 py-3 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
