"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TournamentBracketPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPhone, setUserPhone] = useState("");

  const fetchTournament = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments/${params.id}`);
      const data = await res.json();
      if (!data.error) {
        setTournament(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "ADMIN") setIsAdmin(true);
      setUserPhone(user.name); // name holds the phone now based on authController
    }
    if (params.id) fetchTournament();
  }, [params.id]);

  const updateMatchScore = async (matchId: number, scoreA: number, scoreB: number, status: string) => {
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ scoreA, scoreB, status })
      });
      fetchTournament();
    } catch (err) {
      console.error(err);
      alert("Failed to update score");
    }
  };

  const handleShuffle = async () => {
    if (!confirm("Are you sure you want to shuffle Round 1 teams? This will randomize their opponents.")) return;
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments/${params.id}/shuffle`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      fetchTournament();
    } catch (err) {
      alert("Failed to shuffle teams");
    }
  };

  const handleSetTime = async (round: number, isLower: boolean) => {
    const timeStr = prompt("Enter time (e.g. 2024-12-01T15:00):");
    if (!timeStr) return;
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tournaments/${params.id}/schedule`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ round, isLower, time: timeStr })
      });
      fetchTournament();
    } catch (err) {
      alert("Failed to set schedule");
    }
  };

  const handleAddTeam = async (matchId: number, slot: string, name: string, phone: string) => {
    if (!name.trim()) return alert("Team name is required");
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";
      
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}/teams`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ slot, name, phone })
      });
      fetchTournament();
    } catch (err) {
      alert("Failed to add team");
    }
  };

  const handleUpdateTeam = async (teamId: number, name: string, phone: string) => {
    if (!name.trim()) return alert("Team name is required");
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });
      if(!res.ok) throw new Error("Failed");
      fetchTournament();
    } catch (err) {
      alert("Failed to update team");
    }
  };

  const handleUploadEvidence = async (matchId: number, fileLobby: File, fileResult: File) => {
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";

      const formData = new FormData();
      formData.append("evidenceLobby", fileLobby);
      formData.append("evidenceResult", fileResult);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}/evidence`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if(!res.ok) {
        const data = await res.json();
        alert(data.error || "Upload failed");
      } else {
        alert("Evidence uploaded successfully!");
        fetchTournament();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload evidence");
    }
  };

  const handleValidateMatch = async (matchId: number, action: string, winnerId?: number) => {
    try {
      const userStr = localStorage.getItem("user");
      const token = userStr ? JSON.parse(userStr).token : "";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}/validate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action, winnerId })
      });

      if(!res.ok) {
        const data = await res.json();
        alert(data.error || "Validation failed");
      } else {
        fetchTournament();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to validate match");
    }
  };

  if (loading) {
    return <main className="flex-1 flex justify-center items-center p-xl"><span className="text-on-surface-variant font-title-lg">Loading bracket...</span></main>;
  }

  if (!tournament) {
    return <main className="flex-1 flex justify-center items-center p-xl"><span className="text-error font-title-lg">Tournament not found</span></main>;
  }

  const upperMatches = tournament.matches.filter((m: any) => !m.isLowerBracket);
  const lowerMatches = tournament.matches.filter((m: any) => m.isLowerBracket);

  let champion = null;
  if (tournament.status === "FINISHED") {
    // Cari match terakhir (tidak punya nextMatch dan nextLoserMatch)
    const finalMatch = tournament.matches.find((m: any) => !m.nextMatchId && !m.nextLoserMatchId);
    if (finalMatch && finalMatch.winnerId) {
      champion = finalMatch.winnerId === finalMatch.teamA?.id ? finalMatch.teamA : finalMatch.teamB;
    }
  }

  const groupRounds = (matches: any[]) => {
    return matches.reduce((acc: any, match: any) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {});
  };

  const upperRounds = groupRounds(upperMatches);
  const lowerRounds = groupRounds(lowerMatches);

  return (
    <main className="flex-1 flex flex-col p-md sm:p-lg gap-xl mx-auto w-full max-w-[1400px] overflow-x-auto">
      {/* Header Info */}
      <section className="flex flex-col gap-sm sticky left-0 z-10 bg-background/90 p-sm backdrop-blur">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <span className="px-sm py-xs rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">{tournament.status}</span>
            <span className="font-label-sm text-label-sm text-secondary">{tournament.format.replace("_", " ")}</span>
          </div>
          {isAdmin && (
            <button onClick={handleShuffle} className="bg-surface-variant hover:bg-surface-dim text-on-surface-variant font-title-sm px-sm py-xs rounded flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">shuffle</span>
              Shuffle Teams
            </button>
          )}
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">{tournament.name}</h1>
        {tournament.description && (
          <p className="text-on-surface-variant text-body-md max-w-3xl mt-1">{tournament.description}</p>
        )}
      </section>

      {/* Upper Bracket View */}
      <div className="flex flex-col gap-md pb-xl">
        <h2 className="font-title-lg text-primary sticky left-0">Upper Bracket</h2>
        <div className="flex gap-xl min-w-max">
          {Object.keys(upperRounds).map((roundKey) => {
            const matches = upperRounds[roundKey];
            return (
              <section key={roundKey} className="flex flex-col gap-md w-[320px] shrink-0">
                <div className="flex justify-between items-center border-b border-surface-variant pb-xs sticky left-0 bg-background z-10">
                  <h3 className="font-title-md text-title-md text-on-surface">Round {roundKey}</h3>
                  {isAdmin && (
                    <button onClick={() => handleSetTime(Number(roundKey), false)} className="text-secondary hover:text-primary transition-colors flex items-center gap-xs text-xs font-bold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> Set Time
                    </button>
                  )}
                </div>
                
                <div className="h-full mt-4">
                  <MatchColumn 
                    matches={matches} 
                    nextRoundMatches={upperRounds[Number(roundKey) + 1]}
                    isLastRound={!upperRounds[Number(roundKey) + 1]}
                    isAdmin={isAdmin} 
                    userPhone={userPhone}
                    onUpdate={updateMatchScore}
                    onAddTeam={handleAddTeam}
                    onUpdateTeam={handleUpdateTeam}
                    onUploadEvidence={handleUploadEvidence}
                    onValidateMatch={handleValidateMatch}
                  />
                </div>
              </section>
            );
          })}
          {champion && (
            <section className="flex flex-col gap-md w-[320px] shrink-0 justify-center items-center relative z-10 animate-in fade-in slide-in-from-left-4 duration-1000">
              <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-[#ffcfb3]/20 to-surface-container border border-primary/50 p-8 rounded-2xl shadow-[0_0_60px_rgba(255,182,139,0.3)] w-full text-center">
                <span className="material-symbols-outlined text-[80px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <div className="flex flex-col items-center">
                  <span className="text-secondary font-bold tracking-widest uppercase text-sm mb-1">Grand Champion</span>
                  <h2 className="text-3xl font-extrabold text-on-surface leading-tight">{champion.name}</h2>
                  {champion.phone && (
                    <span className="text-on-surface-variant font-label-sm mt-2 px-3 py-1 bg-surface-variant/50 rounded-full">
                      {champion.phone}
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Lower Bracket View */}
      {Object.keys(lowerRounds).length > 0 && (
        <div className="flex flex-col gap-md pb-xl pt-xl border-t-2 border-dashed border-surface-variant">
          <h2 className="font-title-lg text-secondary sticky left-0">Lower Bracket</h2>
          <div className="flex gap-xl min-w-max">
            {Object.keys(lowerRounds).map((roundKey) => {
              const matches = lowerRounds[roundKey];
              return (
                <section key={roundKey} className="flex flex-col gap-md w-[320px] shrink-0">
                  <div className="flex justify-between items-center border-b border-surface-variant pb-xs sticky left-0 bg-background z-10">
                    <h3 className="font-title-md text-title-md text-on-surface">Round {roundKey}</h3>
                    {isAdmin && (
                      <button onClick={() => handleSetTime(Number(roundKey), true)} className="text-secondary hover:text-primary transition-colors flex items-center gap-xs text-xs font-bold">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> Set Time
                      </button>
                    )}
                  </div>
                  
                  <div className="h-full mt-4">
                    <MatchColumn 
                      matches={matches} 
                      nextRoundMatches={lowerRounds[Number(roundKey) + 1]}
                      isLastRound={!lowerRounds[Number(roundKey) + 1]}
                      isAdmin={isAdmin} 
                      userPhone={userPhone}
                      onUpdate={updateMatchScore}
                      onAddTeam={handleAddTeam}
                      onUpdateTeam={handleUpdateTeam}
                      onUploadEvidence={handleUploadEvidence}
                      onValidateMatch={handleValidateMatch}
                    />
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

function MatchColumn({ 
  matches, 
  nextRoundMatches, 
  isLastRound, 
  isAdmin, 
  userPhone, 
  onUpdate, 
  onAddTeam, 
  onUpdateTeam, 
  onUploadEvidence, 
  onValidateMatch 
}: any) {
  const isCombineRound = nextRoundMatches && nextRoundMatches.length < matches.length;

  const groups = [];
  if (isCombineRound) {
    for(let i=0; i<matches.length; i+=2) {
      groups.push(matches.slice(i, i+2));
    }
  } else {
    for(let i=0; i<matches.length; i+=1) {
      groups.push([matches[i]]);
    }
  }

  return (
    <div className="flex flex-col gap-xl justify-around h-full w-full relative">
       {groups.map((group, idx) => (
         <div key={idx} className="flex flex-col justify-around relative flex-1">
            {group.map((match: any) => (
              <div key={match.id} className="relative w-full z-10 flex flex-col justify-center">
                <MatchNode 
                  match={match} 
                  isAdmin={isAdmin} 
                  userPhone={userPhone}
                  onUpdate={onUpdate}
                  onAddTeam={onAddTeam}
                  onUpdateTeam={onUpdateTeam}
                  onUploadEvidence={onUploadEvidence}
                  onValidateMatch={onValidateMatch}
                />
                {!isLastRound && (
                  <div className="absolute top-1/2 right-[-20px] w-[20px] h-[2px] bg-surface-variant z-0" />
                )}
              </div>
            ))}
            
            {!isLastRound && (
              <>
                {group.length === 2 ? (
                  <>
                    <div className="absolute right-[-20px] top-[25%] bottom-[25%] w-[2px] bg-surface-variant z-0" />
                    <div className="absolute right-[-40px] top-1/2 w-[20px] h-[2px] bg-surface-variant z-0" />
                  </>
                ) : (
                  <div className="absolute right-[-40px] top-1/2 w-[20px] h-[2px] bg-surface-variant z-0" />
                )}
              </>
            )}
         </div>
       ))}
    </div>
  );
}

// Komponen Card Pertandingan
function MatchNode({ match, isAdmin, userPhone, onUpdate, onAddTeam, onUpdateTeam, onUploadEvidence, onValidateMatch }: { match: any, isAdmin: boolean, userPhone: string, onUpdate: any, onAddTeam: any, onUpdateTeam: any, onUploadEvidence: any, onValidateMatch: any }) {
  const [scoreA, setScoreA] = useState(match.scoreA);
  const [scoreB, setScoreB] = useState(match.scoreB);
  
  const [teamAName, setTeamAName] = useState("");
  const [teamAPhone, setTeamAPhone] = useState("");
  
  const [teamBName, setTeamBName] = useState("");
  const [teamBPhone, setTeamBPhone] = useState("");

  const [isSavingA, setIsSavingA] = useState(false);
  const [isSavingB, setIsSavingB] = useState(false);

  const [isEditingA, setIsEditingA] = useState(false);
  const [isEditingB, setIsEditingB] = useState(false);

  const [lobbyFile, setLobbyFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const isFinished = match.status === "FINISHED";
  const isMyTeam = !isAdmin && ((match.teamA && match.teamA.phone === userPhone) || (match.teamB && match.teamB.phone === userPhone));

  const handleScoreUpdate = () => {
    onUpdate(match.id, scoreA, scoreB, "LIVE");
  };

  const handleFinalize = () => {
    if(scoreA === scoreB) {
      alert("Scores cannot be tied to finalize.");
      return;
    }
    const winnerId = scoreA > scoreB ? match.teamA.id : match.teamB.id;
    if (confirm("Are you sure you want to finalize this match? The winner will advance.")) {
      onValidateMatch(match.id, 'APPROVE', winnerId);
    }
  };

  const submitTeamA = async () => {
    setIsSavingA(true);
    if (isEditingA && match.teamA) {
      await onUpdateTeam(match.teamA.id, teamAName, teamAPhone);
      setIsEditingA(false);
    } else {
      await onAddTeam(match.id, 'A', teamAName, teamAPhone);
    }
    setIsSavingA(false);
  };

  const submitTeamB = async () => {
    setIsSavingB(true);
    if (isEditingB && match.teamB) {
      await onUpdateTeam(match.teamB.id, teamBName, teamBPhone);
      setIsEditingB(false);
    } else {
      await onAddTeam(match.id, 'B', teamBName, teamBPhone);
    }
    setIsSavingB(false);
  };

  const enableEditA = () => {
    setTeamAName(match.teamA.name);
    setTeamAPhone(match.teamA.phone || "");
    setIsEditingA(true);
  };

  const enableEditB = () => {
    setTeamBName(match.teamB.name);
    setTeamBPhone(match.teamB.phone || "");
    setIsEditingB(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(lobbyFile && resultFile) {
      onUploadEvidence(match.id, lobbyFile, resultFile);
      setShowUpload(false);
    }
  };

  return (
    <article className={`bg-surface-container rounded-lg border overflow-hidden flex flex-col relative ${isFinished ? 'border-outline-variant' : 'border-primary/50 shadow-[0_0_15px_rgba(255,182,139,0.1)]'}`}>
      <div className="bg-surface-dim px-md py-sm flex justify-between items-center border-b border-surface-variant">
        <span className="font-label-sm text-label-sm text-on-surface-variant flex flex-col">
          <span>Match #{match.id}</span>
          {match.scheduledTime && <span className="text-xs text-primary">{new Date(match.scheduledTime).toLocaleString()}</span>}
        </span>
        {isFinished ? (
          <span className="font-label-sm text-label-sm px-sm py-xs rounded-full bg-surface-bright text-on-surface-variant">Finished</span>
        ) : (
          <span className="font-label-sm text-label-sm px-sm py-xs rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-xs">
            {match.teamA && match.teamB ? "Live" : "Pending"}
          </span>
        )}
      </div>
      
      {/* Team A */}
      <div className={`flex justify-between items-center p-md border-b border-surface-variant ${isFinished && match.winnerId === match.teamA?.id ? 'bg-primary-container/5 border-r-4 border-r-primary' : ''}`}>
        {!match.teamA || isEditingA ? (
          isAdmin && match.round === 1 && !match.isLowerBracket ? (
            <form onSubmit={(e) => { e.preventDefault(); submitTeamA(); }} className="flex flex-col gap-1 w-full mr-2">
              <input type="text" placeholder="Team A Name" value={teamAName} onChange={e => setTeamAName(e.target.value)} className="w-full bg-background border border-surface-variant rounded text-sm p-1 text-on-surface" />
              <div className="flex gap-1">
                <input type="text" placeholder="Phone" value={teamAPhone} onChange={e => setTeamAPhone(e.target.value)} className="w-full bg-background border border-surface-variant rounded text-sm p-1 text-on-surface" />
                <button type="submit" disabled={isSavingA} className="bg-primary text-on-primary text-xs px-2 rounded hover:bg-surface-tint disabled:opacity-50 min-w-[50px]">
                  {isSavingA ? "..." : "Save"}
                </button>
                {isEditingA && (
                  <button type="button" onClick={() => setIsEditingA(false)} className="bg-surface-variant text-on-surface-variant text-xs px-2 rounded hover:bg-surface-dim">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-sm opacity-50">
              <span className="font-bracket-node italic text-on-surface-variant">TBD</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">group</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-bracket-node text-bracket-node ${isFinished && match.winnerId === match.teamA?.id ? 'text-primary' : 'text-on-background'}`}>
                {match.teamA.name}
              </span>
              {match.teamA.phone && isAdmin && <span className="text-xs text-on-surface-variant">{match.teamA.phone}</span>}
              <div className="flex gap-2 items-center">
                {!isAdmin && match.teamA.phone && match.teamA.phone !== userPhone && (
                  <a href={`https://wa.me/${match.teamA.phone}`} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline">Chat WA</a>
                )}
                {isAdmin && match.round === 1 && !match.isLowerBracket && !isFinished && (
                  <button onClick={enableEditA} className="text-xs text-secondary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">edit</span> Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isAdmin && !isFinished && match.teamA && match.teamB ? (
          <input type="number" value={scoreA} onChange={e => setScoreA(Number(e.target.value))} onBlur={handleScoreUpdate} className="w-12 bg-surface-dim border border-outline-variant rounded p-1 text-center font-bracket-node text-on-surface" />
        ) : (
          match.teamA && match.teamB && <span className="font-bracket-node text-bracket-node text-on-background text-lg">{match.scoreA}</span>
        )}
      </div>
      
      {/* Team B */}
      <div className={`flex justify-between items-center p-md ${isFinished && match.winnerId === match.teamB?.id ? 'bg-primary-container/5 border-r-4 border-r-primary' : ''}`}>
        {!match.teamB || isEditingB ? (
          isAdmin && match.round === 1 && !match.isLowerBracket ? (
            <form onSubmit={(e) => { e.preventDefault(); submitTeamB(); }} className="flex flex-col gap-1 w-full mr-2">
              <input type="text" placeholder="Team B Name" value={teamBName} onChange={e => setTeamBName(e.target.value)} className="w-full bg-background border border-surface-variant rounded text-sm p-1 text-on-surface" />
              <div className="flex gap-1">
                <input type="text" placeholder="Phone" value={teamBPhone} onChange={e => setTeamBPhone(e.target.value)} className="w-full bg-background border border-surface-variant rounded text-sm p-1 text-on-surface" />
                <button type="submit" disabled={isSavingB} className="bg-primary text-on-primary text-xs px-2 rounded hover:bg-surface-tint disabled:opacity-50 min-w-[50px]">
                  {isSavingB ? "..." : "Save"}
                </button>
                {isEditingB && (
                  <button type="button" onClick={() => setIsEditingB(false)} className="bg-surface-variant text-on-surface-variant text-xs px-2 rounded hover:bg-surface-dim">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-sm opacity-50">
              <span className="font-bracket-node italic text-on-surface-variant">TBD</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">group</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-bracket-node text-bracket-node ${isFinished && match.winnerId === match.teamB?.id ? 'text-primary' : 'text-on-background'}`}>
                {match.teamB.name}
              </span>
              {match.teamB.phone && isAdmin && <span className="text-xs text-on-surface-variant">{match.teamB.phone}</span>}
              <div className="flex gap-2 items-center">
                {!isAdmin && match.teamB.phone && match.teamB.phone !== userPhone && (
                  <a href={`https://wa.me/${match.teamB.phone}`} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline">Chat WA</a>
                )}
                {isAdmin && match.round === 1 && !match.isLowerBracket && !isFinished && (
                  <button onClick={enableEditB} className="text-xs text-secondary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">edit</span> Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {isAdmin && !isFinished && match.teamA && match.teamB ? (
          <input type="number" value={scoreB} onChange={e => setScoreB(Number(e.target.value))} onBlur={handleScoreUpdate} className="w-12 bg-surface-dim border border-outline-variant rounded p-1 text-center font-bracket-node text-on-surface" />
        ) : (
          match.teamA && match.teamB && <span className="font-bracket-node text-bracket-node text-on-background text-lg">{match.scoreB}</span>
        )}
      </div>

      {/* Upload Evidence / Validate Section */}
      {!isFinished && match.teamA && match.teamB && (
        <div className="bg-surface-dim p-sm flex flex-col items-center border-t border-surface-variant gap-sm">
          
          {isAdmin && match.evidenceStatus === "UPLOADED" && (
            <div className="w-full flex flex-col gap-xs text-sm">
              <div className="flex gap-2">
                <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/${match.evidenceLobby}`} target="_blank" className="text-secondary hover:underline">View Lobby</a>
                <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/${match.evidenceResult}`} target="_blank" className="text-secondary hover:underline">View Result</a>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <button onClick={() => onValidateMatch(match.id, 'APPROVE', scoreA > scoreB ? match.teamA.id : match.teamB.id)} className="flex-1 bg-green-600/20 text-green-500 text-xs py-1 rounded">Approve</button>
                <button onClick={() => onValidateMatch(match.id, 'REJECT')} className="flex-1 bg-red-600/20 text-red-500 text-xs py-1 rounded">Reject</button>
              </div>
              <div className="flex gap-2 w-full mt-1">
                <button onClick={() => onValidateMatch(match.id, 'DISQUALIFY', match.teamB.id)} className="flex-1 bg-orange-600/20 text-orange-500 text-xs py-1 rounded">DQ A (B Wins)</button>
                <button onClick={() => onValidateMatch(match.id, 'DISQUALIFY', match.teamA.id)} className="flex-1 bg-orange-600/20 text-orange-500 text-xs py-1 rounded">DQ B (A Wins)</button>
              </div>
            </div>
          )}

          {isAdmin && match.evidenceStatus !== "UPLOADED" && (
             <button onClick={handleFinalize} className="bg-primary/20 text-primary hover:bg-primary hover:text-on-primary transition-colors text-label-md px-sm py-xs rounded w-full">
              Force Finalize (No Evidence)
             </button>
          )}

          {isMyTeam && match.evidenceStatus !== "UPLOADED" && match.evidenceStatus !== "APPROVED" && (
            <div className="w-full">
              {!showUpload ? (
                <button onClick={() => setShowUpload(true)} className="w-full bg-secondary/20 text-secondary hover:bg-secondary hover:text-on-primary transition-colors text-label-md px-sm py-xs rounded">
                  {match.evidenceStatus === "REJECTED" ? "Upload Again (Rejected)" : "Upload Evidence"}
                </button>
              ) : (
                <form onSubmit={handleUploadSubmit} className="flex flex-col gap-2 text-xs">
                  <label className="text-on-surface">Lobby Screenshot</label>
                  <input type="file" required accept="image/*" onChange={e => setLobbyFile(e.target.files?.[0] || null)} className="text-on-surface-variant"/>
                  <label className="text-on-surface">Result Screenshot</label>
                  <input type="file" required accept="image/*" onChange={e => setResultFile(e.target.files?.[0] || null)} className="text-on-surface-variant"/>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="flex-1 bg-primary text-on-primary py-1 rounded">Submit</button>
                    <button type="button" onClick={() => setShowUpload(false)} className="flex-1 bg-surface-variant text-on-surface-variant py-1 rounded">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {isMyTeam && match.evidenceStatus === "UPLOADED" && (
            <span className="text-xs text-yellow-500">Evidence uploaded, waiting for admin...</span>
          )}
        </div>
      )}
    </article>
  );
}
