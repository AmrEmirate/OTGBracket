"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TournamentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopAppBar Component */}
      <header className="bg-background sticky w-full top-0 z-50 border-b border-outline-variant shadow-none transition-all duration-200 ease-in-out">
        <div className="flex justify-between items-center w-full px-lg h-16">
          {/* Brand */}
          <div className="flex items-center gap-md">
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-black text-primary">OTGBracket</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-lg items-center h-full">
            <Link href="#" className="h-full flex items-center text-primary border-b-2 border-primary pb-xs font-title-md text-title-md">Brackets</Link>
            <button onClick={() => alert("Halaman Players sedang dalam pengembangan")} className="h-full flex items-center text-on-surface-variant hover:text-secondary font-title-md text-title-md">Players</button>
            <button onClick={() => alert("Halaman Rules sedang dalam pengembangan")} className="h-full flex items-center text-on-surface-variant hover:text-secondary font-title-md text-title-md">Rules</button>
          </nav>

          {/* Trailing Actions */}
          <div className="flex items-center gap-md">
            <button className="hidden sm:block bg-primary text-on-primary px-md py-sm rounded-DEFAULT font-title-md text-title-md hover:bg-surface-tint transition-colors">
              Finalize Match
            </button>
            <div className="flex gap-sm text-on-surface-variant">
              <button aria-label="notifications" className="p-xs hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <Link href="/login" aria-label="account_circle" className="p-xs hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex bg-surface-container-low border-b border-surface-variant overflow-x-auto">
        <Link href="#" className="flex-1 text-center py-md border-b-2 border-primary text-primary font-title-md text-title-md">Bracket</Link>
        <Link href="#" className="flex-1 text-center py-md text-on-surface-variant hover:text-secondary transition-colors font-title-md text-title-md">Schedule</Link>
      </div>

      {children}
    </div>
  );
}
