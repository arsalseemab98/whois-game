"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Eye, EyeOff, ArrowLeft, Send, CheckCircle, AlertTriangle, Clock, Trophy, PenLine } from "lucide-react";

const PLAYERS = ["Bia", "Kamran", "Shamama", "Arsal", "Sabrina", "Shazil", "Alina"];

// 4 specific reasons per question, 5th is always custom
const WHY_PER_QUESTION: string[][] = [
  // Q1: Who is the most dramatic?
  ["Makes everything about themselves", "Cries over nothing", "Always needs attention", "Creates problems out of thin air"],
  // Q2: Who gets angry the fastest?
  ["Snaps over the smallest thing", "Their face says it all", "Zero patience, zero chill", "Everyone walks on eggshells around them"],
  // Q3: Who pretends to be nice but isn't?
  ["Talks sweet then backstabs", "Their smile is fake", "Nice in person, toxic in group chat", "Two-faced energy 24/7"],
  // Q4: Who is the most stubborn?
  ["Never admits they're wrong", "Will argue till everyone gives up", "Their way or no way", "Has never changed their mind once"],
  // Q5: Who overreacts the most?
  ["Makes a mountain out of nothing", "Small issue = world war 3", "Everything is the end of the world", "Drama queen/king energy"],
  // Q6: Who spends the most time on their phone?
  ["Always scrolling, never listening", "Phone is glued to their hand", "Takes 0.2 seconds to reply", "Can't survive 5 minutes without it"],
  // Q7: Who lies the most?
  ["Their stories never add up", "They lie about the dumbest things", "Can't trust a word they say", "Even their 'truth' sounds suspicious"],
  // Q8: Who is the laziest?
  ["Would pay someone to breathe for them", "Never wants to do anything", "Always cancels plans last minute", "Their couch knows them best"],
  // Q9: Who eats the most?
  ["Always hungry, always eating", "Orders the most food every time", "Finishes everyone else's plate too", "Their stomach has no limit"],
  // Q10: Who is always late?
  ["Has never been on time once", "Their 5 minutes = 45 minutes", "The group always waits for them", "They think time is a suggestion"],
  // Q11: Who is hiding something right now?
  ["Acting sus lately", "Something is definitely off about them", "They've been too quiet", "Their energy changed recently"],
  // Q12: Who would snitch first?
  ["Can't keep a secret to save their life", "Would sell you out for a snack", "Loyalty? They don't know her", "First to fold under pressure"],
  // Q13: Who talks behind people's back?
  ["Says one thing to your face, another behind it", "The group gossip machine", "Has tea on everyone", "Their mouth never stops"],
  // Q14: Who is the biggest overthinker?
  ["Reads into everything too much", "One text = 3 hours of analysis", "Creates scenarios that don't exist", "Their brain never shuts off"],
  // Q15: Who gets jealous the easiest?
  ["Can't stand when others succeed", "Competitive over everything", "Their face when someone else gets praised", "Green with envy 24/7"],
  // Q16: Who would cry first in an argument?
  ["Tears come before the first sentence ends", "Emotionally fragile", "Uses crying as a weapon", "Can't handle confrontation"],
  // Q17: Who thinks they are always right?
  ["Has never said 'I was wrong'", "Argues facts with opinions", "Google could tell them they're wrong and they'd disagree", "Main character syndrome"],
  // Q18: Who is the most annoying?
  ["Doesn't know when to stop", "Gets on everyone's nerves", "Tries too hard to be funny", "The group tolerates them at best"],
  // Q19: Who would lose in a fight?
  ["All talk, no action", "Would run before throwing a punch", "Their arms are decorative", "Wouldn't last 2 seconds"],
  // Q20: Who is the weakest mentally?
  ["Breaks down over small things", "Can't handle any pressure", "Needs constant reassurance", "Falls apart when things get tough"],
  // Q21: Who is the fakest?
  ["Changes personality for every person", "Their whole vibe is an act", "Nobody really knows the real them", "Fake laughs, fake everything"],
  // Q22: Who tries too hard to impress others?
  ["Always flexing for no reason", "Needs everyone's validation", "Changes themselves for attention", "Tries too hard to be cool"],
  // Q23: Who would betray the group first?
  ["Would drop everyone for a better offer", "Has no real loyalty", "Already has one foot out the door", "Self-interest always comes first"],
  // Q24: Who is secretly the favorite?
  ["Everyone secretly likes them more", "Gets away with everything", "The group protects them", "Can do no wrong apparently"],
  // Q25: Who is the biggest problem here?
  ["The root cause of all drama", "Remove them and everything is peaceful", "Brings chaos wherever they go", "The group would be better without them"],
  // Q26: Who has the worst taste in music?
  ["Their playlist is a crime", "Nobody wants the aux from them", "Thinks their music is fire but it's trash", "Plays the same 3 songs on repeat"],
  // Q27: Who thinks they're funny but ISN'T?
  ["Laughs at their own jokes alone", "Nobody laughs but they keep going", "Thinks they're a comedian", "Their humor is stuck in 2015"],
  // Q28: Who would survive last in a zombie apocalypse?
  ["Would trip and fall first", "Too slow to run", "Would try to reason with the zombies", "Would be hiding crying somewhere"],
  // Q29: Who is the most toxic in relationships?
  ["Red flags everywhere", "Their ex would agree 100%", "Relationship destroyer", "Brings drama into every relationship"],
  // Q30: Who would sell the group out for money?
  ["Has a price and it's low", "Money over friends always", "Would snitch for $50", "Zero loyalty when cash is involved"],
  // Q31: Who has the biggest ego?
  ["Thinks they're God's gift to earth", "Mirror is their best friend", "Can't stop talking about themselves", "Ego bigger than their brain"],
  // Q32: Who is the most two-faced?
  ["Different person with different people", "You never know which version you'll get", "Sweet to your face, savage behind your back", "Has more faces than a clock"],
  // Q33: Who gossips the most but says they don't?
  ["'I don't gossip BUT...' every time", "Knows everyone's business", "The walking newspaper", "Says 'don't tell anyone' then tells everyone"],
  // Q34: Who would ghost everyone first?
  ["Already takes forever to respond", "Disappears without warning regularly", "Has ghosted before and will again", "Their phone is always on silent"],
  // Q35: Who is the most delusional about themselves?
  ["Lives in a fantasy world", "Sees themselves completely differently than everyone else", "Thinks they're perfect", "Has zero self-awareness"],
  // Q36: If Bia has a child, whose personality should it have?
  ["They have the best personality here", "The child would be unstoppable", "They're the only normal one", "Anyone but Bia's own personality"],
  // Q37: If Kamran has a child, whose personality should it have?
  ["They have the best personality here", "The child would be unstoppable", "They're the only normal one", "Anyone but Kamran's own personality"],
  // Q38: If Shamama has a child, whose personality should it have?
  ["They have the best personality here", "The child would be unstoppable", "They're the only normal one", "Anyone but Shamama's own personality"],
  // Q39: If Arsal has a child, whose personality should it have?
  ["They have the best personality here", "The child would be unstoppable", "They're the only normal one", "Anyone but Arsal's own personality"],
  // Q40: If Sabrina has a child, whose personality should it have?
  ["They have the best personality here", "The child would be unstoppable", "They're the only normal one", "Anyone but Sabrina's own personality"],
  // Q41: If Shazil has a child, whose personality should it have?
  ["They have the best personality here", "The child would be unstoppable", "They're the only normal one", "Anyone but Shazil's own personality"],
  // Q42: If Alina has a child, whose personality should it have?
  ["They have the best personality here", "The child would be unstoppable", "They're the only normal one", "Anyone but Alina's own personality"],
];

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
  const [game, setGame] = useState<GameState>({ status: "lobby", currentQuestion: 0, totalQuestions: 42, kickVersion: 1 });
  const [voted, setVoted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [shuffledPlayers, setShuffledPlayers] = useState<string[]>([...PLAYERS].sort(() => Math.random() - 0.5));
  const [voteError, setVoteError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        const res = await fetch("/api/state?type=game&t=" + Date.now(), { cache: "no-store" });
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
          setShowCustomReason(false);
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
          setShowCustomReason(false);
          setVoteError(false);
          setSubmitting(false);

          // Check if we already voted on this question (handles refresh/rejoin)
          try {
            const vRes = await fetch(`/api/state?type=votes&question=${data.currentQuestion}&t=${Date.now()}`, { cache: "no-store" });
            const vData = await vRes.json();
            const myVote = vData.votes.find((v: { voterId: string }) => v.voterId === getPlayerId());
            if (myVote) {
              setVoted(true);
              setSelectedAnswer(myVote.target);
              setReason(myVote.reason);
            }
          } catch { /* ignore */ }
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
        await fetch("/api/state?t=" + Date.now(), {
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
    if (!selectedAnswer || submitting) return;
    setSubmitting(true);
    setShowFlash(true);
    setShowReasonInput(false);
    setVoted(true);
    setVoteError(false);

    try {
      const res = await fetch("/api/state?t=" + Date.now(), {
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

    setSubmitting(false);
    setTimeout(() => setShowFlash(false), 500);
  };

  // ── JOIN ──
  if (!joined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center animate-slide-up">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-2">
            WHO IS<span className="text-red-500">...</span>
          </h1>
          <p className="text-zinc-500 text-base font-mono flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 text-red-500" /> enter your name to join <Flame className="w-4 h-4 text-red-500" />
          </p>
        </div>

        {/* How it works */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-sm w-full text-sm text-zinc-400 space-y-2">
          <p className="text-zinc-300 font-semibold text-center mb-2">How it works</p>
          <p><span className="text-red-400 font-bold">No correct answers!</span> Vote for who you think fits each question best.</p>
          <p>After everyone votes, the person with <span className="text-red-400 font-bold">the most votes</span> is revealed with reasons.</p>
          <p className="text-zinc-500 text-xs text-center pt-1">The goal? Start chaos in the group chat.</p>
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
            <span className="text-zinc-400 flex items-center gap-1.5">
              {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Stay Anonymous
            </span>
          </label>
          <button
            onClick={async () => {
              if (isAnonymous || playerName.trim()) {
                const name = isAnonymous ? "Anonymous" : playerName.trim();
                try {
                  // Register player
                  await fetch("/api/state?t=" + Date.now(), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "player", id: getPlayerId(), name }),
                  });
                  // Immediately fetch game state so we don't show stale lobby
                  const res = await fetch("/api/state?type=game&t=" + Date.now(), { cache: "no-store" });
                  const data = await res.json();
                  kickVersionRef.current = data.kickVersion;
                  setGame(data);

                  // Check if already voted on current question (rejoin scenario)
                  if (data.status === "question") {
                    const vRes = await fetch(`/api/state?type=votes&question=${data.currentQuestion}&t=${Date.now()}`, { cache: "no-store" });
                    const vData = await vRes.json();
                    const myVote = vData.votes.find((v: { voterId: string }) => v.voterId === getPlayerId());
                    if (myVote) {
                      setVoted(true);
                      setSelectedAnswer(myVote.target);
                      setReason(myVote.reason);
                    }
                  }
                } catch { /* ignore */ }
                setJoined(true);
              }
            }}
            disabled={!isAnonymous && !playerName.trim()}
            className="w-full py-4 px-8 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            <Flame className="w-5 h-5 inline" /> JOIN GAME
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
          <Clock className="w-12 h-12 text-zinc-500 mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-400 text-lg">Waiting for host to start...</p>
          <p className="text-zinc-600 text-sm font-mono mt-2 flex items-center justify-center gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Look at the big screen!
          </p>
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
            {voteError
              ? <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              : <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />}
            <p className={`text-xl font-bold ${voteError ? "text-orange-400" : "text-green-400"}`}>
              {voteError ? "Vote may not have sent!" : "Vote submitted!"}
            </p>
            <p className="text-zinc-500 text-sm font-mono mt-2">You picked: <span className="text-red-400 font-bold">{selectedAnswer}</span></p>
            {reason && <p className="text-zinc-600 text-xs italic mt-2">&quot;{reason}&quot;</p>}
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
          <div className="flex-1 flex flex-col gap-3 animate-slide-up max-w-sm mx-auto w-full">
            <div className="text-center mb-1">
              <p className="text-zinc-400 text-sm font-mono mb-1">You picked</p>
              <p className="text-2xl font-black text-red-400">{selectedAnswer}</p>
              <p className="text-zinc-500 text-xs font-mono mt-1">Now pick WHY</p>
            </div>

            {/* Question-specific reason options (4) + custom (5th) */}
            {!showCustomReason ? (
              <div className="space-y-2 flex-1 overflow-y-auto">
                {(WHY_PER_QUESTION[game.currentQuestion] || []).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setReason(opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all border ${
                      reason === opt
                        ? "bg-red-600/20 border-red-600/50 text-red-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {reason === opt ? <CheckCircle className="w-4 h-4 inline mr-2 text-red-400" /> : null}
                    {opt}
                  </button>
                ))}
                <button
                  onClick={() => { setShowCustomReason(true); setReason(""); }}
                  className="w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all border bg-zinc-900 border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 flex items-center gap-2"
                >
                  <PenLine className="w-4 h-4" /> Write your own reason...
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea placeholder="Spill the tea... why them?" value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-20"
                  autoFocus />
                <button onClick={() => { setShowCustomReason(false); setReason(""); }}
                  className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
                  <ArrowLeft className="w-3 h-3 inline" /> Back to options
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setSelectedAnswer(null); setShowReasonInput(false); setReason(""); setShowCustomReason(false); }}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-all border border-zinc-700 text-sm flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Change
              </button>
              <button onClick={handleSubmitVote} disabled={!reason || submitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1.5">
                <Send className="w-4 h-4" /> {submitting ? "Sending..." : "Submit"}
              </button>
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
        <Trophy className="w-16 h-16 text-red-400 animate-pulse" />
        <h1 className="text-4xl font-black">GAME OVER</h1>
        <p className="text-zinc-400 font-mono flex items-center gap-2">
          <Eye className="w-4 h-4" /> Look at the big screen for final results!
        </p>
        <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
      </main>
    );
  }

  return null;
}
