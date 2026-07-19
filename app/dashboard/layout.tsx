"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)] flex text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* 
        Adjusting left margin:
        Sidebar width is w-64 (16rem).
        With m-4 (1rem) on left and right of sidebar, the total space is 18rem.
        So lg:ml-[18rem] 
      */}
      <div className="flex-1 lg:ml-[17rem] flex flex-col min-h-screen relative transition-all duration-300">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        
        <AnimatePresence mode="wait">
          <motion.main 
            key={pathname}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 p-6 lg:p-8 w-full max-w-7xl mx-auto"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
