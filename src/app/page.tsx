"use client";

import { useState, useEffect, useRef } from "react";

const PLAYERS = ["Bia", "Kamran", "Shamama", "Arsal", "Sabrina", "Shazil", "Alina"];

const COLORS = [
  "from-red-600 to-red-700", "from-orange-600 to-orange-700", "from-amber-600 to-amber-700",
  "from-emerald-600 to-emerald-700", "from-blue-600 to-blue-700", "from-purple-600 to-purple-700",
  "from-pink-600 to-pink-700",
];

type GameState = { status: "lobby" | "question" | "final"; currentQuestion: number; totalQuestions: number; kickVersion: number };

function getPlayerId() {
  if (typeof window === "undefined") return "";
  // Use localStorage so ID persists across resets/rejoins
  let id = localStorage.getItem("whois-player-id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("whois-player-id", id);
  }
  return id;
}

export default function MobilePage() {
  const [playerName, setPlayerName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [joined, setJoined] = useState(false);
  const [game, setGame] = useState<GameState>({ status: "lobby", currentQuestion: 0, totalQuestions: 35, kickVersion: 1 });
  const [voted, setVoted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  const [showFlash, setShowFlash] = useState(false);
  const [shuffledPlayers, setShuffledPlayers] = useState<string[]>([...PLAYERS].sort(() => Math.random() - 0.5));
  const [voteError, setVoteError] = useState(false);

  const gameRef = useRef(game);
  const kickVersionRef = useRef(-1);
  const joinedRef = useRef(false);
  const voterNameRef = useRef("");
  gameRef.current = game;
  joinedRef.current = joined;

  const voterName = isAnonymous ? "Anonymous" : playerName;
  voterNameRef.current = voterName;

  // Fisher-Yates shuffle
  useEffect(() => {
    const arr = [...PLAYERS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledPlayers(arr);
  }, [game.currentQuestion]);

  // Fast game state polling (1s) — separate from heartbeat
  useEffect(() => {
    const pollGame = async () => {
      try {
        const res = await fetch("/api/state?type=game");
        const data: GameState = await res.json();

        // First poll: sync kickVersion
        if (kickVersionRef.current === -1) {
          kickVersionRef.current = data.kickVersion;
        }

        // Kick detection
        if (data.kickVersion > kickVersionRef.current && joinedRef.current) {
          kickVersionRef.current = data.kickVersion;
          setJoined(false);
          setVoted(false);
          setSelectedAnswer(null);
          setShowReasonInput(false);
          setReason("");
          setGame(data);
          return;
        }
        kickVersionRef.current = data.kickVersion;

        // New question detection
        const prev = gameRef.current;
        if (data.status === "question" && (prev.status !== "question" || data.currentQuestion !== prev.currentQuestion)) {
          setVoted(false);
          setSelectedAnswer(null);
          setShowReasonInput(false);
          setReason("");
          setVoteError(false);
        }

        setGame(data);
      } catch { /* offline */ }
    };

    pollGame();
    const interval = setInterval(pollGame, 1000); // fast polling
    return () => clearInterval(interval);
  }, []);

  // Slower heartbeat (every 5s) — keeps player alive without blocking game state
  useEffect(() => {
    const heartbeat = async () => {
      if (!joinedRef.current) return;
      try {
        await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "player", id: getPlayerId(), name: voterNameRef.current }),
        });
      } catch { /* offline */ }
    };

    const interval = setInterval(heartbeat, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePickPlayer = (target: string) => {
    setSelectedAnswer(target);
    setShowReasonInput(true);
  };

  const handleSubmitVote = async () => {
    if (!selectedAnswer) return;
    setShowFlash(true);
    setShowReasonInput(false);
    setVoted(true);
    setVoteError(false);

    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vote",
          voterId: getPlayerId(),
          voter: voterName,
          question: game.currentQuestion,
          target: selectedAnswer,
          reason,
        }),
      });
      if (!res.ok) setVoteError(true);
    } catch {
      setVoteError(true);
    }

    setTimeout(() => setShowFlash(false), 500);
  };

  // ── JOIN ──
  if (!joined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center animate-slide-up">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-2">
            WHO IS<span className="text-red-500">...</span>
          </h1>
          <p className="text-zinc-500 text-base font-mono">💀 enter your name to join 💀</p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="text" placeholder="Your name..." value={playerName}
            onChange={(e) => setPlayerName(e.target.value)} disabled={isAnonymous}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all disabled:opacity-40 text-lg"
          />
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button type="button" role="checkbox" aria-checked={isAnonymous}
              onClick={() => { setIsAnonymous((v) => !v); if (!isAnonymous) setPlayerName(""); }}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isAnonymous ? "bg-red-600 border-red-600" : "border-zinc-600 hover:border-zinc-400"}`}>
              {isAnonymous && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <span className="text-zinc-400">Stay Anonymous 🕵️</span>
          </label>
          <button
            onClick={async () => {
              if (isAnonymous || playerName.trim()) {
                const name = isAnonymous ? "Anonymous" : playerName.trim();
                try {
                  // Register player
                  await fetch("/api/state", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "player", id: getPlayerId(), name }),
                  });
                  // Immediately fetch game state so we don't show stale lobby
                  const res = await fetch("/api/state?type=game");
                  const data = await res.json();
                  kickVersionRef.current = data.kickVersion;
                  setGame(data);
                } catch { /* ignore */ }
                setJoined(true);
              }
            }}
            disabled={!isAnonymous && !playerName.trim()}
            className="w-full py-4 px-8 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            JOIN GAME 🔥
          </button>
        </div>
      </main>
    );
  }

  // ── LOBBY (only show if game hasn't started yet) ──
  if (game.status === "lobby") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-2">YOU&apos;RE IN! ✅</h1>
          <p className="text-zinc-400 font-mono text-lg">{voterName}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4 animate-pulse">⏳</div>
          <p className="text-zinc-400 text-lg">Waiting for host to start...</p>
          <p className="text-zinc-600 text-sm font-mono mt-2">Look at the big screen!</p>
        </div>
      </main>
    );
  }

  // If game is already running (player joined mid-game), go straight to question/final

  // ── QUESTION ──
  if (game.status === "question") {
    if (voted) {
      return (
        <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <p className="text-zinc-500 font-mono text-sm">Q{game.currentQuestion + 1}/{game.totalQuestions}</p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">{voteError ? "⚠️" : "✅"}</div>
            <p className={`text-xl font-bold ${voteError ? "text-orange-400" : "text-green-400"}`}>
              {voteError ? "Vote may not have sent!" : "Vote submitted!"}
            </p>
            <p className="text-zinc-500 text-sm font-mono mt-2">You picked: <span className="text-red-400 font-bold">{selectedAnswer}</span></p>
            <p className="text-zinc-600 text-xs font-mono mt-4">Waiting for next question...</p>
          </div>
        </main>
      );
    }

    return (
      <main className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full">
        {showFlash && <div className="fixed inset-0 bg-red-600/20 z-50 pointer-events-none animate-shake" />}
        <div className="flex items-center justify-between mb-3">
          <span className="text-zinc-500 font-mono text-sm">{game.currentQuestion + 1}/{game.totalQuestions}</span>
          <span className="text-zinc-600 font-mono text-xs">{voterName}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${((game.currentQuestion + 1) / game.totalQuestions) * 100}%` }} />
        </div>
        <p className="text-center text-zinc-500 text-sm font-mono mb-4">Look at the screen for the question 👀</p>
        {!showReasonInput ? (
          <div className="grid grid-cols-2 gap-3 flex-1 content-start">
            {shuffledPlayers.map((player, i) => (
              <button key={player} onClick={() => handlePickPlayer(player)}
                className={`py-4 px-4 rounded-2xl font-bold text-lg text-white transition-all bg-gradient-to-br ${COLORS[i % COLORS.length]} hover:scale-105 active:scale-95`}>
                {player}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-slide-up">
            <div className="text-center">
              <p className="text-zinc-400 text-sm font-mono mb-1">You picked</p>
              <p className="text-3xl font-black text-red-400">{selectedAnswer}</p>
            </div>
            <textarea placeholder="Why? Spill the tea... ☕🔥 (optional)" value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full max-w-sm px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-24"
              autoFocus />
            <div className="flex gap-3 w-full max-w-sm">
              <button onClick={() => { setSelectedAnswer(null); setShowReasonInput(false); setReason(""); }}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-all border border-zinc-700 text-sm">← Change</button>
              <button onClick={handleSubmitVote}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all text-sm">Submit 💀</button>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ── FINAL ──
  if (game.status === "final") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="text-4xl font-black">GAME OVER 💀</h1>
        <p className="text-zinc-400 font-mono">Look at the big screen for final results!</p>
        <div className="text-6xl animate-pulse">🔥</div>
      </main>
    );
  }

  return null;
}
