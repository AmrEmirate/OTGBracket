"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "waiting_wa">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "waiting_wa" && sessionId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wa/poll/${sessionId}`);
          
          if (res.status === 404) {
            clearInterval(interval);
            setStatus("idle");
            setSessionId("");
            setErrorMsg("Sesi telah digunakan (Login berhasil di tab lain) atau kadaluarsa.");
            return;
          }

          const data = await res.json();
          
          if (data.status === "SUCCESS" && data.user) {
            clearInterval(interval);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, sessionId, router]);

  const handleLoginWA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setErrorMsg("Masukkan nomor WhatsApp yang valid");
      return;
    }
    
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wa/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate session");
      }

      setSessionId(data.sessionId);
      setStatus("waiting_wa");
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred");
      setStatus("idle");
    }
  };

  // Remove Dev simulate webhook function

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>

      {/* Brand Header */}
      <div className="text-center mb-xl">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-background mb-sm tracking-tight drop-shadow-[0_0_15px_rgba(255,182,139,0.3)]">
          Pro<span className="text-primary">Bracket</span>
        </h1>
        <p className="font-title-md text-title-md text-on-surface-variant max-w-[24rem] mx-auto">
          The ultimate tournament management platform for serious competitors.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[28rem] bg-surface-container rounded-2xl border border-surface-variant shadow-2xl overflow-hidden backdrop-blur-xl bg-opacity-90">
        


        <div className="p-xl text-center">
          {errorMsg && (
            <div className="bg-error/10 border border-error/50 text-error p-sm rounded-lg text-center font-body-md text-body-md mb-lg">
              {errorMsg}
            </div>
          )}

          {status === "waiting_wa" ? (
            <div className="flex flex-col items-center gap-md py-md">
              <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl animate-bounce">mark_email_unread</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">Cek WhatsApp Anda!</h2>
              <p className="text-on-surface-variant mb-6 px-4">
                Kami telah mengirimkan sebuah **Tautan Ajaib (Magic Link)** ke nomor <br/>
                <span className="font-bold text-primary">{phone}</span>.<br/><br/>
                Silakan buka aplikasi WhatsApp Anda dan klik tautan tersebut untuk masuk. Halaman ini akan otomatis beralih jika Anda sudah mengklik tautan tersebut.
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-center gap-2 text-on-surface-variant/70 mb-4">
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>Menunggu konfirmasi...</span>
                </div>
                <button 
                  onClick={() => { setStatus("idle"); setSessionId(""); }}
                  className="w-full text-error hover:underline font-medium"
                >
                  Batal & Ganti Nomor
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLoginWA} className="flex flex-col gap-lg py-md">
              <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-3xl">chat</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface">Login via WhatsApp</h2>
              <p className="text-on-surface-variant">
                Masukkan nomor WhatsApp Anda. Kami akan mengirimkan tautan ajaib untuk masuk seketika.
              </p>

              <div className="text-left">
                <label className="block text-sm font-medium text-on-surface-variant mb-2">Nomor WhatsApp</label>
                <input 
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={status === "loading"}
                  className="w-full bg-surface-dim border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={status === "loading" || !phone}
                className="w-full mt-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-all duration-300 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {status === "loading" ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">send</span>
                    <span>Kirim Tautan Login</span>
                  </>
                )}
              </button>
            </form>
          )}


        </div>
      </div>
      
      {/* Footer minimal */}
      <div className="mt-xl text-center">
        <p className="font-label-sm text-label-sm text-on-surface-variant/70">
          © 2024 OTGBracket. All rights reserved.
        </p>
      </div>
    </div>
  );
}
