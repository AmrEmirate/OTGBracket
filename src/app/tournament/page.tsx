"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Tournament {
  id: number;
  name: string;
  format: string;
  status: string;
  participantCount: number;
  admin: {
    phone: string;
    role: string;
  };
}

export default function TournamentListPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments`);
        const data = await res.json();
        if (data.success && data.tournaments) {
          setTournaments(data.tournaments);
        }
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkAdmin = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === "ADMIN");
        } catch(e) {}
      }
    };

    checkAdmin();
    fetchTournaments();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete tournament "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setTournaments(prev => prev.filter(t => t.id !== id));
      } else {
        alert("Failed to delete tournament");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-12 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-background">Explore Tournaments</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl">
          Hasil tur atau tur yang berjalan yang telah dibuat oleh admin.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-primary">
          <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="bg-surface-container rounded-2xl p-12 text-center border border-outline/20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">sports_esports</span>
          <h2 className="text-2xl font-bold text-on-surface mb-2">No Tournaments Yet</h2>
          <p className="text-on-surface-variant">Belum ada turnamen yang dibuat oleh admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <div key={t.id} onClick={() => router.push(`/tournament/${t.id}`)} className="group cursor-pointer bg-surface-container rounded-xl p-6 border border-outline/20 hover:border-primary/50 transition-all hover:shadow-[0_8px_30px_rgba(255,182,139,0.1)] hover:-translate-y-1 flex flex-col h-full relative">
              {isAdmin && (
                <button 
                  onClick={(e) => handleDelete(e, t.id, t.name)}
                  className="absolute top-4 right-4 text-on-surface-variant hover:text-error hover:bg-error/10 p-1 rounded transition-colors z-10"
                  title="Delete Tournament"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              )}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.status === 'UPCOMING' ? 'bg-primary/20 text-primary' : 
                  t.status === 'LIVE' ? 'bg-error/20 text-error' : 
                  'bg-secondary/20 text-secondary'
                }`}>
                  {t.status}
                </span>
                <span className="text-xs text-on-surface-variant font-medium bg-surface-variant px-2 py-1 rounded">
                  {t.format.replace('_', ' ')}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {t.name}
              </h2>
              
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-outline/10 text-sm">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base">groups</span>
                  <span>{t.participantCount} Players</span>
                </div>
                <div className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Bracket <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
