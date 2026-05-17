"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
  requiredPlan: "Starter" | "Professional" | "Enterprise";
  currentPlan: "Starter" | "Professional" | "Enterprise" | "Trial";
  featureName: string;
  children: React.ReactNode;
}

export function FeatureGate({ requiredPlan, currentPlan, featureName, children }: FeatureGateProps) {
  // Simple plan hierarchy logic for demo purposes
  const planLevels = {
    "Trial": 1,
    "Starter": 1,
    "Professional": 2,
    "Enterprise": 3
  };

  const hasAccess = planLevels[currentPlan] >= planLevels[requiredPlan];

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
      <div className="absolute inset-0 bg-slate-900/5 dark:bg-black/40 backdrop-blur-[2px] z-10"></div>
      <div className="relative z-20 max-w-sm mx-auto">
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{featureName}</h3>
        <p className="text-sm text-slate-500 mb-6">
          This feature requires the <span className="font-semibold text-primary-600 dark:text-primary-400">{requiredPlan}</span> plan or higher. Upgrade your academy to unlock advanced capabilities.
        </p>
        <Link href="/dashboard/settings/billing" className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-medium shadow-sm transition-all text-sm inline-flex">
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
