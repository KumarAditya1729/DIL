"use client";

import { ArrowLeft, Edit, Printer, Send, Activity, BookOpen, AlertTriangle, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchStudentDetails } from "@/app/actions/students";

type StudentProfile = {
  id: string;
  name: string;
  dob: string;
  gender: string;
  joinDate: string;
  status: string;
  styles: string[];
  batches: string[];
  parent: { name: string; phone: string; email: string };
  medical: string;
  attendance: string;
  feeStatus: string;
  progress: { date: string; note: string }[];
};

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails(params.id).then(data => {
      setStudent(data);
      setIsLoading(false);
    });
  }, [params.id]);

  if (isLoading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  if (!student) {
    return <div className="py-24 text-center text-slate-500">Student not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
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
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all text-sm flex items-center justify-center gap-2">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card & Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <div className="h-24 bg-gradient-to-br from-primary-500 to-primary-700 relative">
              <div className="absolute top-0 right-0 p-4 opacity-30"><BookOpen className="w-16 h-16 text-white" /></div>
            </div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 absolute -top-12 flex items-center justify-center text-3xl font-bold text-primary-600 shadow-md">
                {student.name.charAt(0)}
              </div>
              <div className="mt-14">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
              <AlertTriangle className="w-5 h-5" />
              Medical Information
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-400/80 leading-relaxed">
              {student.medical}
            </p>
          </div>
        </div>

        {/* Right Column: Details & Progress */}
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
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dance Styles</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {student.styles.map((style, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Assigned Batches</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {student.batches.map((batch, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
                      {batch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Parent/Guardian Contact</h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-200">{student.parent.name}</p>
                  <p className="text-sm text-slate-500">{student.parent.phone} • {student.parent.email}</p>
                </div>
                <button className="p-2 bg-white dark:bg-slate-700 rounded-lg text-green-600 shadow-sm hover:shadow-md transition-shadow">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Progress Tracking
              </h3>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Add Note</button>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {student.progress.map((prog, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-primary-100 dark:bg-primary-900/30 text-primary-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <time className="text-xs font-medium text-primary-600 dark:text-primary-400">{prog.date}</time>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{prog.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
