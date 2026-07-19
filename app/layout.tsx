import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { CommandPalette } from "@/components/CommandPalette";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIL",
  description: "Where Passion Becomes Performance",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.className}>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] flex flex-col min-h-screen">
        <ThemeProvider>
          <div className="flex-1 flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
            {children}
          </div>
          <CommandPalette />
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm rounded-xl',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
