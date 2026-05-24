"use client";

import { ArrowLeft, Edit, Printer, Send, Activity, BookOpen, AlertTriangle, Loader2, X, Save, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<"progress" | "attendance">("progress");
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
      loadStudent(); // Refresh data
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

  if (isLoading) return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  if (!student) return <div className="py-24 text-center text-slate-500">Student not found.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/students" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
            <p className="text-slate-500 text-sm mt-1">{student.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium shadow-sm transition-all text-sm flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print ID Card</span>
          </button>
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all text-sm flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <div className="h-24 bg-gradient-to-br from-primary-500 to-primary-700 relative">
              <div className="absolute top-0 right-0 p-4 opacity-30"><BookOpen className="w-16 h-16 text-white" /></div>
            </div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-primary-100 dark:bg-primary-900/30 absolute -top-12 flex items-center justify-center text-3xl font-bold text-primary-600 shadow-md">
                {student.name.charAt(0)}
              </div>
              <div className="mt-14">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-md text-xs font-medium capitalize ${
                  student.status === 'active' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : student.status === 'alumni'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {student.status}
                </span>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Attendance</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.attendance}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Fee Status</span>
                  <span className="font-medium text-green-600">{student.feeStatus}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Joined</span>
                  <span className="font-medium text-slate-900 dark:text-white">{student.joinDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30 shadow-sm p-6">
            <h3 className="font-bold text-amber-900 dark:text-amber-500 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" /> Medical Information
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-400/80 leading-relaxed">{student.medical}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{student.dob}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gender</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{student.gender}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Courses</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {student.styles.map((style, i) => <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{style}</span>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Assigned Batches</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {student.batches.map((batch, i) => <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">{batch}</span>)}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Aadhar Card Holder</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{student.aadhar.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Aadhar Card Number</p>
                <p className="font-medium text-slate-900 dark:text-slate-200">{student.aadhar.number}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Parent/Guardian Contact</h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-200">{student.parent.name}</p>
                  <p className="text-sm text-slate-500">
                    Call: {student.parent.phone}
                    {student.parent.whatsapp ? ` • WhatsApp: ${student.parent.whatsapp}` : ""}
                    {student.parent.email !== 'N/A' ? ` • ${student.parent.email}` : ""}
                  </p>
                </div>
                <a href={`https://wa.me/${(student.parent.whatsapp || student.parent.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-white dark:bg-slate-700 rounded-lg text-green-600 shadow-sm hover:shadow-md transition-shadow">
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Tabs for Progress and Attendance */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab("progress")}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "progress" ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Progress Tracking
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === "attendance" ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500 hover:text-slate-700"}`}
              >
                Attendance History
              </button>
            </div>

            <div className="p-6">
              {activeTab === "progress" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-500" /> Notes Timeline
                    </h3>
                    <button onClick={() => setNoteOpen(true)} className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                      <Plus className="w-4 h-4" /> Add Note
                    </button>
                  </div>

                  {/* Add Note Inline */}
                  {noteOpen && (
                    <div className="mb-6 p-4 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-xl space-y-3">
                      <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        placeholder="Write a progress note... e.g. 'Improved footwork significantly this week.'"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500 resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setNoteOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                        <button onClick={handleAddNote} disabled={isSavingNote || !note.trim()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg flex items-center gap-2 disabled:opacity-60 transition-colors">
                          {isSavingNote && <Loader2 className="w-4 h-4 animate-spin" />} Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {student.progress.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">No progress notes yet. Add the first one!</p>
                  ) : (
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                      {student.progress.map((prog, i) => (
                        <div key={i} className="relative flex items-start gap-4 pl-14">
                          <div className="absolute left-0 w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center z-10">
                            <div className="w-2 h-2 rounded-full bg-primary-500" />
                          </div>
                          <div className="flex-1 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-sm">
                            <time className="text-xs font-medium text-primary-600 dark:text-primary-400">{prog.date}</time>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{prog.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "attendance" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> Recent Attendance
                    </h3>
                    <div className="text-sm">
                      <span className="font-bold text-slate-900 dark:text-white">{student.attendancePct}%</span>
                      <span className="text-slate-500 ml-1">Overall</span>
                    </div>
                  </div>

                  {attendanceHistory.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">No attendance records found for the last 3 months.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {attendanceHistory.map((record, i) => (
                        <div key={i} className="py-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                              {new Date(record.date).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-xs text-slate-500">{record.batch}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                            record.status === "present" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : record.status === "absent" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Drawer ─────────────────────────────────── */}
      {isEditOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" onClick={() => setIsEditOpen(false)} />

          {/* Slide-in panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Student Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">{student.id}</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                  <input name="fullName" required defaultValue={student.name} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number <span className="text-red-500">*</span></label>
                  <input name="mobileNumber" required defaultValue={student.parent.phone} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                  <input name="whatsappNumber" defaultValue={student.parent.whatsapp || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input name="email" type="email" defaultValue={student.parent.email !== 'N/A' ? student.parent.email : ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent / Guardian Name</label>
                  <input name="parentName" defaultValue={student.parent.name !== 'N/A' ? student.parent.name : ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aadhar Card Holder Name</label>
                  <input name="aadharName" defaultValue={student.aadhar.name !== 'N/A' ? student.aadhar.name : ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Aadhar Card Number</label>
                  <input name="aadharNumber" type="text" inputMode="numeric" pattern="[0-9]{12}" maxLength={12} defaultValue={student.aadhar.number !== 'N/A' ? student.aadhar.number : ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input name="dob" type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                  <select name="gender" defaultValue={student.gender !== 'N/A' ? student.gender : ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white">
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Courses</label>
                  <select name="danceStyle" defaultValue={student.styles[0] || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white">
                    <option value="">Select Course</option>
                    <option>Dance</option><option>Music</option><option>Art Zone</option><option>Kathak</option><option>Martial Arts</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batch</label>
                  <select name="batch" defaultValue={student.batches[0] || ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white">
                    <option value="">Select Batch</option>
                    {batches.length === 0 ? (
                      <option disabled value="">⚠️ No batches created. Create one first in Batches module!</option>
                    ) : (
                      batches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.style})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select name="status" defaultValue={student.status} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medical Notes</label>
                  <textarea name="medicalNotes" rows={3} defaultValue={student.medical !== 'No medical conditions reported.' ? student.medical : ''} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white resize-none" />
                </div>
              </div>
            </form>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button
                form=""
                onClick={(e) => {
                  // Trigger the form inside the drawer
                  const form = (e.currentTarget as HTMLElement).closest('.fixed')?.querySelector('form');
                  form?.requestSubmit();
                }}
                disabled={isSaving}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-70 shadow-sm transition-colors"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
