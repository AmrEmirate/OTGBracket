"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TournamentSetupPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("single");
  const [participantCount, setParticipantCount] = useState("8");
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<"loading" | "unauthorized" | "forbidden" | "authorized">("loading");
  const router = useRouter();

  React.useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setAuthStatus("unauthorized");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "ADMIN") {
        setAuthStatus("forbidden");
      } else {
        setAuthStatus("authorized");
      }
    } catch (e) {
      setAuthStatus("unauthorized");
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: name || "OTG Bracket Tournament", 
          description: description,
          format: format === "single" ? "SINGLE_ELIMINATION" : "DOUBLE_ELIMINATION", 
          participantCount 
        })
      });
      const data = await res.json();
      if (data.success && data.tournamentId) {
        router.push(`/tournament/${data.tournamentId}`);
      } else {
        alert(data.error || "Failed to generate bracket");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center p-xl">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
      </div>
    );
  }

  if (authStatus === "unauthorized") {
    return (
      <div className="max-w-md mx-auto mt-20 flex flex-col items-center text-center gap-md bg-surface-container rounded-2xl p-xl border border-outline-variant shadow-lg">
        <span className="material-symbols-outlined text-6xl text-error mb-2">lock</span>
        <h1 className="font-headline-md text-headline-md text-on-surface">Authentication Required</h1>
        <p className="text-on-surface-variant font-body-md">You need to log in to access this page.</p>
        <button onClick={() => router.push("/login")} className="mt-4 px-6 py-3 rounded-full bg-primary text-on-primary font-bold hover:brightness-110 transition-all">
          Go to Login
        </button>
      </div>
    );
  }

  if (authStatus === "forbidden") {
    return (
      <div className="max-w-md mx-auto mt-20 flex flex-col items-center text-center gap-md bg-surface-container rounded-2xl p-xl border border-error/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-error"></div>
        <span className="material-symbols-outlined text-6xl text-error mb-2">gpp_bad</span>
        <h1 className="font-headline-md text-headline-md text-on-surface">Access Denied</h1>
        <p className="text-on-surface-variant font-body-md">Anda bukan admin! Halaman ini hanya untuk pengguna dengan hak akses administrator.</p>
        <button onClick={() => router.push("/")} className="mt-4 px-6 py-3 rounded-full border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full flex flex-col gap-xl">
      <header className="flex flex-col gap-xs">
        <h1 className="font-headline-lg text-headline-lg text-on-background">Tournament Setup</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Configure the core rules and structure of your upcoming tournament before inviting participants.</p>
      </header>

      {/* Main Configuration Card */}
      <section className="bg-surface-container rounded-2xl border border-surface-variant p-lg md:p-xl shadow-lg flex flex-col gap-xl">
        
        {/* Step 1: Basic Info */}
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-title-md font-bold">1</span>
            <h2 className="font-title-lg text-title-lg text-on-surface">Basic Information</h2>
          </div>
          
          <div className="pl-0 md:pl-10 flex flex-col gap-md">
            <div className="w-full flex flex-col gap-sm">
              <label className="text-on-surface-variant font-medium">Tournament Title</label>
              <input 
                type="text"
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-on-surface text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. OTG Bracket Championship 2026"
              />
            </div>
            
            <div className="w-full flex flex-col gap-sm">
              <label className="text-on-surface-variant font-medium">Description (Optional)</label>
              <textarea 
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-on-surface text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell your participants about the rules, prizes, or schedule..."
              />
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/50" />

        {/* Step 2: Format */}
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-title-md font-bold">2</span>
            <h2 className="font-title-lg text-title-lg text-on-surface">Select Bracket Format</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md pl-0 md:pl-10">
            {/* Single Elimination Option */}
            <label className={`relative flex items-start gap-md p-md rounded-xl border-2 cursor-pointer transition-all ${format === "single" ? "border-primary bg-primary/5" : "border-outline-variant hover:border-outline hover:bg-surface-variant/30"}`}>
              <div className="flex items-center h-6">
                <input type="radio" name="format" value="single" className="w-5 h-5 text-primary bg-surface-dim border-outline-variant focus:ring-primary focus:ring-offset-surface-container" defaultChecked onChange={() => setFormat("single")} />
              </div>
              <div className="flex flex-col gap-xs">
                <span className="font-title-md text-title-md text-on-surface">Single Elimination</span>
                <span className="font-body-md text-body-md text-on-surface-variant">A straightforward knockout tournament. Losers are immediately eliminated.</span>
              </div>
            </label>

            {/* Double Elimination Option */}
            <label className={`relative flex items-start gap-md p-md rounded-xl border-2 cursor-pointer transition-all ${format === "double" ? "border-primary bg-primary/5" : "border-outline-variant hover:border-outline hover:bg-surface-variant/30"}`}>
              <div className="flex items-center h-6">
                <input type="radio" name="format" value="double" className="w-5 h-5 text-primary bg-surface-dim border-outline-variant focus:ring-primary focus:ring-offset-surface-container" onChange={() => setFormat("double")} />
              </div>
              <div className="flex flex-col gap-xs">
                <span className="font-title-md text-title-md text-on-surface">Double Elimination</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Includes a Losers bracket. A team must lose twice to be eliminated.</span>
                <span className="inline-block px-sm py-xs mt-sm text-xs rounded-md bg-secondary/20 text-secondary w-max border border-secondary/30">Beta Feature</span>
              </div>
            </label>
          </div>
        </div>

        <hr className="border-outline-variant/50" />

        {/* Step 3: Participants */}
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-title-md font-bold">3</span>
            <h2 className="font-title-lg text-title-lg text-on-surface">Participant Count</h2>
          </div>
          
          <div className="pl-0 md:pl-10">
            <div className="w-full max-w-[24rem] flex flex-col gap-sm">
              <label className="sr-only">Number of participants</label>
              <input 
                type="number"
                min="2"
                max="512"
                className="w-full bg-surface-dim border border-outline-variant rounded-lg p-3 text-on-surface text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={participantCount}
                onChange={(e) => setParticipantCount(e.target.value)}
                placeholder="Contoh: 16, 24, 100"
              />
              <p className="text-sm text-on-surface-variant">Determines the number of initial rounds. Byes will be added automatically if participant count isn't full.</p>
            </div>
          </div>
        </div>

      </section>

      {/* Action Footer */}
      <div className="flex justify-end pt-md">
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-primary hover:bg-surface-tint text-on-primary font-title-md text-title-md px-xl py-md rounded-lg shadow-[0_4px_14px_rgba(255,182,139,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-sm"
        >
          <span className="material-symbols-outlined">account_tree</span>
          {loading ? "Generating..." : "Generate Initial Bracket"}
        </button>
      </div>

    </div>
  );
}
