import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16 pb-24 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-500">No hidden fees. No surprise charges. Start scaling your academy today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Starter</h3>
            <p className="text-slate-500 text-sm mt-2 h-10">Perfect for growing studios.</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹1,999</span>
              <span className="text-slate-500">/mo</span>
            </div>
            <Link href="/onboarding" className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium text-center transition-colors mb-8">
              Start Free Trial
            </Link>
            <div className="space-y-4 flex-1">
              {['Up to 100 Students', 'Basic Attendance', 'Manual Invoicing', '1 Admin User'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 border border-primary-500 shadow-2xl shadow-primary-500/20 relative flex flex-col transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
              Most Popular
            </div>
            <h3 className="text-lg font-semibold text-white">Professional</h3>
            <p className="text-slate-400 text-sm mt-2 h-10">Everything you need to automate.</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-white">₹4,999</span>
              <span className="text-slate-400">/mo</span>
            </div>
            <Link href="/onboarding" className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-center transition-colors mb-8 shadow-lg shadow-primary-500/30">
              Start Free Trial
            </Link>
            <div className="space-y-4 flex-1">
              {['Up to 500 Students', 'QR Code Attendance', 'Automated Razorpay Billing', 'WhatsApp Notifications', 'Full Event Ecosystem', '3 Admin Users'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-primary-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Enterprise</h3>
            <p className="text-slate-500 text-sm mt-2 h-10">For massive institutions.</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹14,999</span>
              <span className="text-slate-500">/mo</span>
            </div>
            <Link href="#contact" className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium text-center transition-colors mb-8">
              Contact Sales
            </Link>
            <div className="space-y-4 flex-1">
              {['Unlimited Students', 'Unlimited Admin Users', 'Custom White-labeling', 'API Access', 'Dedicated Account Manager', 'Predictive Analytics Engine'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
