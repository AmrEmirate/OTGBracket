"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-full py-lg px-md bg-surface-dim border-r border-surface-container-low fixed left-0 top-0 w-60 z-20">
        <div className="mb-xl px-sm">
          <h1 className="font-display-lg text-[32px] leading-[40px] font-extrabold text-primary">OTGBracket</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Esports Admin</p>
        </div>
        
        <ul className="flex-grow space-y-sm">
          <li>
            <Link 
              href="/admin/setup"
              className={`flex items-center gap-sm px-md py-sm rounded transition-all active:scale-95 ${pathname === "/admin/setup" ? "border-l-4 border-primary bg-primary-container/10 text-primary font-bold" : "text-on-surface-variant opacity-70 hover:bg-surface-variant"}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/admin/setup" ? "'FILL' 1" : "" }}>dashboard</span>
              <span className="font-label-sm text-label-sm">Dashboard</span>
            </Link>
          </li>
        </ul>
        
        <div className="mt-auto pt-lg border-t border-surface-container-low">
          <ul className="space-y-sm">
            <li>
              <Link 
                href="/login"
                className="flex items-center gap-sm px-md py-sm rounded text-on-surface-variant opacity-70 hover:bg-surface-variant transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-label-sm text-label-sm">Logout</span>
              </Link>
            </li>
          </ul>
          
          <div className="mt-lg flex items-center gap-sm px-sm">
            <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden">
              <img 
                alt="Admin Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-OYpA9hmpk1jzrrBK_svVynYE4wewBuHMI3qNypDoDMEJc_xuLBhD09STgYl8gRonWsL4EwevvP5Y8BC7-YR1Vr16hugalHAuiVa2Q_TJ_F-5KPGi4W3fydH9iAqXq1NX27f8Yoq-D-M-Lky3h-pU-5LGbAhRn8bTcmA6GMN8QANhkXTfn-G5fW5K-T18B7XeGZbIYI_UOrOMKSoZHBIvTthS1xS3s3fJ6Y3a_MEQhEIMbbzY3z0ISV4dempDjtwS05R_HbMMTS4S"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface">Admin User</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-60 h-full overflow-y-auto bg-background p-lg lg:p-xl">
        {children}
      </main>
    </div>
  );
}
