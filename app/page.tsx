import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Zap, BarChart, Smartphone, CalendarCheck, CreditCard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Dance Is Life" className="w-10 h-10 object-contain drop-shadow-md" />
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">Dance Is Life</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2">
              Staff Login <ArrowRight className="w-4 h-4" />
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
            Manage admissions, track attendance, collect fees, and organise spectacular events — all from one unified dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 text-lg group">
              Access Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

