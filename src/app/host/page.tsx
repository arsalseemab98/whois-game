"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, RotateCcw, Crown, Skull, Trophy, Eye, ChevronRight, MessageCircle, Users, Smartphone } from "lucide-react";

const PLAYERS = ["Bia", "Kamran", "Shamama", "Arsal", "Sabrina", "Shazil", "Alina"];

const QUESTIONS = [
  "Who is the most dramatic? 🎭", "Who gets angry the fastest? 😡",
  "Who pretends to be nice but isn't? 😇🐍", "Who is the most stubborn? 🪨",
  "Who overreacts the most? 😱", "Who spends the most time on their phone? 📱",
  "Who lies the most (even small lies)? 🤥", "Who is the laziest? 🦥",
  "Who eats the most? 🍕", "Who is always late? ⏰",
  "Who is hiding something right now? 🤫", "Who would snitch first? 🐀",
  "Who talks behind people's back? 🗣️", "Who is the biggest overthinker? 🧠",
  "Who gets jealous the easiest? 💚", "Who would cry first in an argument? 😭",
  "Who thinks they are always right? 🙄", "Who is the most annoying? 😤",
  "Who would lose in a fight? 👊", "Who is the weakest mentally? 🧊",
  "Who is the fakest? 🎭🐍", "Who tries too hard to impress others? 💅",
  "Who would betray the group first? 🗡️", "Who is secretly the favorite? ⭐",
  "Who is the biggest problem here? 💀", "Who has the worst taste in music? 🎵🤮",
  "Who thinks they're funny but ISN'T? 🤡", "Who would survive last in a zombie apocalypse? 🧟",
  "Who is the most toxic in relationships? ☢️", "Who would sell the group out for money? 💰",
  "Who has the biggest ego? 👑", "Who is the most two-faced? 🎭🎭",
  "Who gossips the most but says 'I don't gossip'? 🫖", "Who would ghost everyone first? 👻",
  "Who is the most delusional about themselves? 🌈",
];

type Vote = { voterId: string; voter: string; question: number; target: string; reason: string };
type PlayerInfo = { id: string; name: string };
type GameState = { status: "lobby" | "question" | "final"; currentQuestion: number; totalQuestions: number; kickVersion: number };

const COLORS_BG = ["bg-red-600", "bg-orange-600", "bg-amber-600", "bg-emerald-600", "bg-blue-600", "bg-purple-600", "bg-pink-600"];

export default function HostPage() {
  const [game, setGame] = useState<GameState>({ status: "lobby", currentQuestion: 0, totalQuestions: 35, kickVersion: 1 });
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [currentQVotes, setCurrentQVotes] = useState<Vote[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [joinedPlayers, setJoinedPlayers] = useState<PlayerInfo[]>([]);
  const [joinToast, setJoinToast] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const gameRef = useRef(game);
  const joinedIdsRef = useRef<string[]>([]);
  const lastQVoteCount = useRef(0);
  gameRef.current = game;

  const sendAction = async (action: string) => {
    const res = await fetch("/api/state?t=" + Date.now(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "game", action }),
    });
    const data = await res.json();
    setGame(data);
    gameRef.current = data;
    lastQVoteCount.current = 0;
    setCurrentQVotes([]);
    setRevealed(false);
  };

  const resetAll = async () => {
    await sendAction("reset");
    setAllVotes([]);
    setCurrentQVotes([]);
    setJoinedPlayers([]);
    joinedIdsRef.current = [];
    lastQVoteCount.current = 0;
  };

  useEffect(() => {
    const poll = async () => {
      try {
        const t = Date.now();

        // ALWAYS fetch game state from server — detect cold starts and desyncs
        const gRes = await fetch(`/api/state?type=game&t=${t}`, { cache: "no-store" });
        const serverGame: GameState = await gRes.json();
        setGame(serverGame);
        gameRef.current = serverGame;

        // Fetch players
        const pRes = await fetch(`/api/state?type=players&t=${t}`, { cache: "no-store" });
        const pData = await pRes.json();
        const serverPlayers: PlayerInfo[] = pData.players;
        const serverIds = serverPlayers.map((p) => p.id);

        // Toast for new player
        if (serverPlayers.length > joinedIdsRef.current.length && joinedIdsRef.current.length > 0) {
          const newP = serverPlayers.find((p) => !joinedIdsRef.current.includes(p.id));
          if (newP) {
            setJoinToast(newP.name);
            setTimeout(() => setJoinToast(null), 3000);
          }
        }
        joinedIdsRef.current = serverIds;
        setJoinedPlayers(serverPlayers);

        // Fetch votes for current question (use server game state, not stale local)
        if (serverGame.status === "question") {
          const vRes = await fetch(`/api/state?type=votes&question=${serverGame.currentQuestion}&t=${t}`, { cache: "no-store" });
          const vData = await vRes.json();
          if (vData.votes.length > lastQVoteCount.current) {
            setFlash(true);
            setTimeout(() => setFlash(false), 200);
          }
          lastQVoteCount.current = vData.votes.length;
          setCurrentQVotes(vData.votes);
        }

        if (serverGame.status === "final") {
          const aRes = await fetch(`/api/state?type=votes&t=${t}`, { cache: "no-store" });
          const aData = await aRes.json();
          setAllVotes(aData.votes);
        }
      } catch { /* offline */ }
    };

    poll();
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, []);

  const getQuestionResults = () => {
    const tally: Record<string, number> = {};
    currentQVotes.forEach((v) => { tally[v.target] = (tally[v.target] || 0) + 1; });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  };

  const getOverallStats = () => {
    const tally: Record<string, number> = {};
    allVotes.forEach((v) => { tally[v.target] = (tally[v.target] || 0) + 1; });
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  };

  const toast = joinToast && (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-2xl shadow-green-600/30">
        🔥 {joinToast} joined!
      </div>
    </div>
  );

  // ── LOBBY ──
  if (game.status === "lobby") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8 min-h-screen">
        {toast}
        <div className="text-center animate-slide-up">
          <h1 className="text-7xl sm:text-9xl font-black tracking-tighter mb-4">WHO IS<span className="text-red-500">...</span></h1>
          <p className="text-zinc-400 text-2xl font-mono">💀 the spiciest game ever 💀</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center max-w-lg">
          <p className="text-zinc-400 text-xl mb-3">Tell everyone to open:</p>
          <p className="text-3xl sm:text-4xl font-black text-white font-mono break-all">
            {typeof window !== "undefined" ? window.location.origin : ""}
          </p>
          <p className="text-zinc-600 text-base font-mono mt-3 flex items-center justify-center gap-1.5">
            <Smartphone className="w-4 h-4" /> on their phones
          </p>
        </div>

        {/* Joined players */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center min-w-[300px]">
          <p className="text-zinc-400 font-mono text-lg mb-3">
            {joinedPlayers.length === 0 ? "Waiting for players..." : `${joinedPlayers.length} player${joinedPlayers.length !== 1 ? "s" : ""} joined:`}
          </p>
          {joinedPlayers.length > 0 && (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {joinedPlayers.map((p) => (
                  <span key={p.id} className="px-4 py-2 bg-zinc-800 rounded-full text-lg text-green-400 border border-green-800/50 font-semibold">
                    ✅ {p.name}
                  </span>
                ))}
              </div>
              <button onClick={() => { if (confirm("Kick all players? They'll need to rejoin.")) resetAll(); }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-mono text-zinc-500 hover:text-red-400 transition-all border border-zinc-700">
                <RotateCcw className="w-3.5 h-3.5 inline" /> Reset & kick all
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {PLAYERS.map((p, i) => (
            <span key={p} className={`px-5 py-2.5 ${COLORS_BG[i]} rounded-full text-lg text-white font-bold`}>{p}</span>
          ))}
        </div>

        <button onClick={() => sendAction("start")} disabled={joinedPlayers.length === 0}
          className="py-5 px-16 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black text-3xl rounded-2xl transition-all hover:scale-105 active:scale-95 animate-pulse-glow disabled:animate-none disabled:hover:scale-100">
          {joinedPlayers.length === 0
            ? <><Users className="w-7 h-7 inline" /> WAITING FOR PLAYERS</>
            : <><Flame className="w-7 h-7 inline" /> START GAME</>}
        </button>
      </main>
    );
  }

  // ── QUESTION ──
  if (game.status === "question") {
    const results = getQuestionResults();
    const maxCount = results[0]?.count || 1;
    const reasons = currentQVotes.filter((v) => v.reason.trim());
    const isLast = game.currentQuestion >= game.totalQuestions - 1;
    // Use voterId (unique per player) not voter name for counting
    const uniqueVoterIds = [...new Set(currentQVotes.map((v) => v.voterId))];
    const totalExpected = joinedPlayers.length || PLAYERS.length;
    const allVotedIn = uniqueVoterIds.length >= totalExpected && totalExpected > 0;
    const showResults = revealed || allVotedIn;

    return (
      <main className="flex-1 flex flex-col p-8 min-h-screen">
        {toast}
        {flash && <div className="fixed inset-0 bg-green-500/10 z-50 pointer-events-none" />}

        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-500 font-mono text-xl">Q{game.currentQuestion + 1}/{game.totalQuestions}</span>
          <div className="flex items-center gap-3">
            {!showResults && <span className="text-green-400 font-mono text-lg animate-pulse">● VOTING</span>}
            {showResults && <span className="text-orange-400 font-mono text-lg">● RESULTS</span>}
            <span className="bg-zinc-800 px-4 py-2 rounded-full font-mono text-lg">{uniqueVoterIds.length}/{totalExpected} voted</span>
            <button onClick={() => { if (confirm("Reset game?")) resetAll(); }}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-mono text-zinc-500 hover:text-red-400 transition-all border border-zinc-700"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="w-full h-2 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${((game.currentQuestion + 1) / game.totalQuestions) * 100}%` }} />
        </div>

        <div key={game.currentQuestion} className="text-center mb-8 animate-slide-up">
          <h2 className="text-4xl sm:text-6xl font-black leading-tight max-w-4xl mx-auto">{QUESTIONS[game.currentQuestion]}</h2>
        </div>

        <div className="flex-1 max-w-3xl mx-auto w-full">
          {!showResults ? (
            <div className="text-center py-8">
              <div className="mb-8">
                <p className="text-8xl font-black text-white tabular-nums">{uniqueVoterIds.length}<span className="text-zinc-600">/{totalExpected}</span></p>
                <p className="text-zinc-500 font-mono text-xl mt-2">votes received</p>
              </div>
              {/* Show which players voted (by matching voterId to joined player id) */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {joinedPlayers.map((p, idx) => {
                  const hasVoted = currentQVotes.some((v) => v.voterId === p.id);
                  return (
                    <span key={p.id} className={`px-5 py-2.5 ${COLORS_BG[idx % COLORS_BG.length]} rounded-2xl text-lg text-white font-bold transition-all duration-300 ${hasVoted ? "opacity-100" : "opacity-20 scale-95"}`}>
                      {hasVoted ? "✅ " : ""}{p.name}
                    </span>
                  );
                })}
              </div>
              {uniqueVoterIds.length > 0 && uniqueVoterIds.length < totalExpected && (
                <p className="text-zinc-600 font-mono animate-pulse">Waiting for more votes...</p>
              )}
              <button onClick={() => setRevealed(true)} className="mt-6 py-3 px-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-lg rounded-2xl transition-all border border-zinc-700">
                <Eye className="w-5 h-5 inline" /> Show Results Now
              </button>
            </div>
          ) : (
            <>
              {results.length === 0 ? (
                <p className="text-center text-zinc-600 text-2xl font-mono">No votes 🤷</p>
              ) : (
                <>
                  <div className="text-center mb-8 animate-slide-up">
                    <p className="text-zinc-400 text-lg font-mono mb-2">THE ANSWER IS...</p>
                    <p className="text-6xl sm:text-7xl font-black text-red-400 animate-shake">{results[0].name} 💀</p>
                  </div>
                  <div className="space-y-4 mb-6">
                    {results.map((entry, i) => (
                      <div key={entry.name} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-2xl flex items-center gap-2">{i === 0 ? <Crown className="w-6 h-6 text-yellow-400" /> : <Skull className="w-5 h-5 text-zinc-500" />} {entry.name}</span>
                          <span className="text-zinc-400 font-mono text-xl">{entry.count}</span>
                        </div>
                        <div className="w-full h-8 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${COLORS_BG[PLAYERS.indexOf(entry.name)] || "bg-zinc-600"}`} style={{ width: `${(entry.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {reasons.length > 0 && (() => {
                    // Find most popular reason
                    const reasonTally: Record<string, number> = {};
                    reasons.forEach((r) => { reasonTally[r.reason] = (reasonTally[r.reason] || 0) + 1; });
                    const topReasons = Object.entries(reasonTally).sort((a, b) => b[1] - a[1]);
                    const topReason = topReasons[0];

                    return (
                      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
                        <h3 className="text-base font-bold text-zinc-400 mb-3 font-mono flex items-center gap-2"><MessageCircle className="w-4 h-4" /> THE TEA</h3>

                        {/* Most popular reason */}
                        {topReason && topReason[1] > 1 && (
                          <div className="bg-red-600/10 border border-red-800/30 rounded-xl p-3 mb-3">
                            <p className="text-xs text-red-400 font-mono mb-1 flex items-center gap-1"><Flame className="w-3 h-3" /> TOP REASON ({topReason[1]} votes)</p>
                            <p className="text-lg text-red-300 font-bold">&quot;{topReason[0]}&quot;</p>
                          </div>
                        )}

                        {/* All reasons */}
                        <div className="space-y-2">
                          {reasons.map((r, i) => (
                            <p key={i} className="text-base text-zinc-300 italic">
                              &quot;{r.reason}&quot; <span className="text-zinc-600 text-sm ml-2">— {r.voter} → {r.target}</span>
                            </p>
                          ))}
                        </div>

                        {/* Reason breakdown */}
                        {topReasons.length > 1 && (
                          <div className="mt-3 pt-3 border-t border-zinc-800">
                            <p className="text-xs text-zinc-500 font-mono mb-2">REASON BREAKDOWN</p>
                            <div className="flex flex-wrap gap-1.5">
                              {topReasons.map(([r, count]) => (
                                <span key={r} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  r === topReason[0] ? "bg-red-600/20 text-red-400 border border-red-600/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                }`}>
                                  &quot;{r.length > 25 ? r.slice(0, 25) + "..." : r}&quot; × {count}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </>
          )}
        </div>

        {showResults && (
          <div className="text-center mt-6">
            <button onClick={() => { setRevealed(false); sendAction("next"); }}
              className="py-4 px-12 bg-red-600 hover:bg-red-500 text-white font-bold text-2xl rounded-2xl transition-all hover:scale-105 active:scale-95">
              {isLast ? <><Trophy className="w-6 h-6 inline" /> FINAL RESULTS</> : <><ChevronRight className="w-6 h-6 inline" /> NEXT QUESTION</>}
            </button>
          </div>
        )}
      </main>
    );
  }

  // ── FINAL ──
  if (game.status === "final") {
    const overall = getOverallStats();
    const totalVotes = allVotes.length;
    const maxVotes = overall[0]?.count || 1;
    const topPerson = overall[0];
    const medals = ["🥇", "🥈", "🥉"];

    return (
      <main className="flex-1 flex flex-col p-8 min-h-screen">
        {toast}
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-7xl font-black mb-2 flex items-center justify-center gap-3">GAME OVER <Skull className="w-12 h-12 text-red-400" /></h1>
          <p className="text-zinc-500 font-mono text-xl">{totalVotes} total votes</p>
        </div>
        {topPerson && (
          <div className="bg-gradient-to-br from-red-900/40 to-orange-900/30 border border-red-800/50 rounded-3xl p-10 mb-10 text-center animate-pulse-glow max-w-2xl mx-auto w-full">
            <p className="text-zinc-400 text-2xl font-mono mb-3">THE BIGGEST PROBLEM IS...</p>
            <p className="text-7xl sm:text-9xl font-black text-red-400 mb-3">{topPerson.name}</p>
            <p className="text-5xl mb-2">💀🔥💀</p>
            <p className="text-zinc-500 font-mono text-xl">{topPerson.count} votes ({totalVotes > 0 ? Math.round((topPerson.count / totalVotes) * 100) : 0}%)</p>
          </div>
        )}
        <div className="max-w-2xl mx-auto w-full mb-8">
          <h2 className="text-2xl font-bold text-zinc-400 mb-6 font-mono flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> FINAL LEADERBOARD</h2>
          <div className="space-y-4">
            {overall.map((entry, i) => (
              <div key={entry.name} className="animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-3xl">{medals[i] || "💀"} {entry.name}</span>
                  <span className="text-zinc-400 font-mono text-xl">{entry.count} ({totalVotes > 0 ? Math.round((entry.count / totalVotes) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-6 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${COLORS_BG[PLAYERS.indexOf(entry.name)] || "bg-zinc-600"}`} style={{ width: `${(entry.count / maxVotes) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center">
          <button onClick={resetAll} className="py-4 px-12 bg-red-600 hover:bg-red-500 text-white font-bold text-2xl rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
            <Flame className="w-7 h-7" /> NEW GAME
          </button>
        </div>
      </main>
    );
  }

  return null;
}
