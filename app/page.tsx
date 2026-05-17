import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Shield, Zap, BarChart, Smartphone, CalendarCheck, CreditCard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Dance Is Life" width={40} height={40} className="object-contain drop-shadow-md" />
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">Dance Is Life</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/parent/login" className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-all">
              Parent Portal
            </Link>
            <Link href="/login" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-1.5">
              Staff Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-accent-400 text-sm font-medium border border-slate-800 shadow-md">
            <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse"></span>
            Where Passion Becomes Performance
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter leading-tight">
            Dance Is Life<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Art & Study Center</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage admissions, track attendance, collect fees, and organize spectacular events — all from one unified dashboard.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-6">
            {/* Parent card */}
            <Link href="/parent/login" className="group p-6 bg-gradient-to-br from-white to-purple-50/20 dark:from-slate-900 dark:to-purple-950/10 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-900/60 shadow-md hover:shadow-xl transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
              <div>
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 mb-4">
                  For Parents
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Parent Portal</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">View invoice statements, payment receipt history, and daily attendance cards.</p>
              </div>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-sm mt-4">
                Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Admin card */}
            <Link href="/login" className="group p-6 bg-gradient-to-br from-white to-primary-50/20 dark:from-slate-900 dark:to-primary-950/10 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-primary-300 dark:hover:border-primary-900/60 shadow-md hover:shadow-xl transition-all text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-xl pointer-events-none"></div>
              <div>
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 mb-4">
                  For Staff
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Admin & Teachers</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">Manage new registrations, attendance registers, collect fees, and dispatch announcements.</p>
              </div>
              <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold text-sm mt-4">
                Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything in one place</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">A complete management system built specifically for dance academies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Smartphone, title: "Student Management", desc: "Manage admissions, profiles, batch assignments, and student records in seconds." },
              { icon: CreditCard, title: "Fee Collection", desc: "Record payments, generate PDF receipts, and send WhatsApp confirmations instantly." },
              { icon: CalendarCheck, title: "Attendance Tracking", desc: "Mark daily batch attendance with one click. View trends over time." },
              { icon: Shield, title: "Secure & Private", desc: "Your academy data is private and protected. Staff-only access with secure login." },
              { icon: BarChart, title: "Reports & Analytics", desc: "View revenue trends, attendance rates, and performance metrics at a glance." },
              { icon: Zap, title: "Events & Showcases", desc: "Plan performances, workshops, and competitions. Track participants and venues." },
            ].map((feat, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900 transition-colors">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 text-primary-600">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Dance Is Life Art & Study Center. All rights reserved.</p>
      </footer>
    </div>
  );
}

