"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<{ phone: string, role: string } | null>(null);
  const [showNotification, setShowNotification] = useState<{ show: boolean, message: string }>({ show: false, message: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleAdminAccess = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user || user.role !== "ADMIN") {
      e.preventDefault();
      setShowNotification({ show: true, message: "Anda bukan admin! Fitur ini hanya untuk administrator." });
      setTimeout(() => setShowNotification({ show: false, message: "" }), 3000);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-on-surface">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-on-primary">
            PB
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">
            OTGBracket
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-on-surface-variant font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/tournament" className="hover:text-primary transition-colors">Tournaments</Link>
          <Link href="/admin/setup" onClick={handleAdminAccess} className="hover:text-primary transition-colors">Admin</Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-on-surface-variant font-medium">Hello, {user.phone}</span>
              <button onClick={handleLogout} className="px-5 py-2 rounded-full font-semibold text-error hover:bg-surface-container transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2 rounded-full bg-primary text-on-primary font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,182,139,0.3)]">
                Log In
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline/30 text-sm font-medium text-secondary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            OTGBracket Beta is Live!
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ffcfb3] to-secondary leading-tight">
            Elevate Your <br /> Esports Tournaments
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
            The ultimate platform to organize, manage, and broadcast your competitive gaming events. Built for organizers, loved by players.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Link href="/admin/setup" onClick={handleAdminAccess} className="px-8 py-4 rounded-full bg-primary text-on-primary font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,182,139,0.4)]">
              Create Tournament
            </Link>
            <Link href="/tournament" className="px-8 py-4 rounded-full bg-surface-container border border-outline/50 text-on-surface font-semibold text-lg hover:bg-surface-variant transition-colors">
              Explore Events
            </Link>
          </div>
        </div>
      </main>



      {/* Footer */}
      <footer className="py-8 border-t border-outline/20 text-center text-on-surface-variant text-sm">
        <p>&copy; {new Date().getFullYear()} OTGBracket. All rights reserved.</p>
      </footer>

      {/* Notification Toast */}
      {showNotification.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-error text-on-error px-6 py-3 rounded-full shadow-lg font-medium flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            {showNotification.message}
          </div>
        </div>
      )}
    </div>
  );
}
