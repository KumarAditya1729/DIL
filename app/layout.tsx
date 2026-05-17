import type { Metadata } from "next";
import { CommandPalette } from "@/components/CommandPalette";
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
    <html lang="en">
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
