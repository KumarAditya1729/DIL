"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Shield, Zap, BarChart, Smartphone, CalendarCheck, CreditCard, Play, Star, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans selection:bg-primary-500/30">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 border-b border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-xl z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-32">
              <Image src="/logo.png" alt="Dance Is Life" fill className="object-contain" sizes="128px" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted)]">
            <a href="#features" className="hover:text-[var(--foreground)] transition-colors">Features</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/parent/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors hidden sm:block">
              Parent Portal
            </Link>
            <Link href="/login" className="px-4 py-2 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full text-sm font-medium transition-all flex items-center gap-2 group">
              Sign In <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[100svh] flex items-center justify-center overflow-hidden bg-black pt-16">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 z-0"
        >
          {/* Using a high-quality dance image from Unsplash */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl flex flex-col items-center"
          >
            <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-medium text-white/90 uppercase tracking-wider">Dance Is Life OS v2.0</span>
            </motion.div>
            
            <motion.h1 variants={item} className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tighter leading-[1.1] mb-8">
              The operating system <br className="hidden md:block"/> for elite academies.
            </motion.h1>
            
            <motion.p variants={item} className="text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed mb-10">
              A premium, unified platform designed to manage admissions, process payments, and track attendance with absolute precision and elegance.
            </motion.p>
            
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-white/90 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 group">
                Open Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/parent/login" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-md border border-white/10">
                Parent Portal
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Statistics / Social Proof */}
      <section className="py-20 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[var(--border-color)]">
            {[
              { label: "Active Students", value: "2,500+" },
              { label: "Daily Classes", value: "120+" },
              { label: "Payments Processed", value: "$4.2M" },
              { label: "Uptime", value: "99.99%" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center px-4">
                <span className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-2">{stat.value}</span>
                <span className="text-sm font-medium text-[var(--muted)]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[var(--foreground)] mb-6">Designed for scale. Built for speed.</h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed">Experience a beautifully crafted interface that gets out of your way and lets you focus on what matters most: running your academy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Smartphone, title: "Modern Data Grid", desc: "Manage students with lightning-fast, keyboard-navigable tables featuring inline editing and context menus." },
              { icon: CreditCard, title: "Frictionless Billing", desc: "Automate invoice generation, track outstanding balances, and send beautiful WhatsApp payment links." },
              { icon: CalendarCheck, title: "Smart Attendance", desc: "Visualize attendance trends with GitHub-style heatmaps and mark registers with a single tap." },
              { icon: BarChart, title: "Deep Analytics", desc: "Make informed decisions with real-time charts, revenue forecasting, and drill-down reports." },
              { icon: Shield, title: "Enterprise Security", desc: "Role-based access control, secure authentication, and private cloud architecture." },
              { icon: Zap, title: "Command Palette", desc: "Press ⌘K to navigate instantly, create new records, or search your entire database in milliseconds." },
            ].map((feat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-[24px] bg-[var(--card-bg)] border border-[var(--border-color)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)] transition-all group"
              >
                <div className="w-12 h-12 rounded-[14px] bg-[var(--background)] border border-[var(--border-color)] flex items-center justify-center mb-6 text-[var(--foreground)] group-hover:scale-110 transition-transform">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] tracking-tight mb-3">{feat.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[var(--foreground)] text-[var(--background)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 text-[var(--background)]">Ready to elevate your academy?</h2>
          <p className="text-xl opacity-70 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the finest dance institutions relying on our operating system to manage their daily operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-[var(--background)] text-[var(--foreground)] hover:scale-105 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2">
              Get Started Now
            </Link>
            <Link href="mailto:contact@danceislife.com" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[var(--background)]/20 hover:bg-[var(--background)]/10 text-[var(--background)] rounded-full text-sm font-semibold transition-all flex items-center justify-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border-color)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-24">
              <Image src="/logo.png" alt="Dance Is Life" fill className="object-contain grayscale opacity-70" sizes="96px" />
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">© {new Date().getFullYear()} All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[var(--muted)]">
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
