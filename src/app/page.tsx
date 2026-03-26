"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Eye, EyeOff, ArrowLeft, Send, CheckCircle, AlertTriangle, Clock, Trophy, PenLine } from "lucide-react";

const PLAYERS = ["Bia", "Kamran", "Shamama", "Arsal", "Sabrina", "Shazil", "Alina"];

// 4 specific reasons per question, 5th is always custom
const WHY_PER_QUESTION: string[][] = [
  // Q1: If Bia has a child, whose personality should it have?
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
  // POSITIVE Q43-Q62
  // Q43: Best heart
  ["Always there for everyone", "Never says no when you need them", "Genuinely cares about people", "Would give their last for a friend"],
  // Q44: Trust with your life
  ["They've proven it many times", "Most reliable person here", "Would never let you down", "Loyal to the core"],
  // Q45: Best advice
  ["Actually listens before speaking", "Been through a lot, learned from it", "Always gives it straight, no sugar coating", "Wise beyond their years"],
  // Q46: Actually funny
  ["Makes everyone laugh effortlessly", "Timing is always perfect", "Funny without trying", "The group comedian for real"],
  // Q47: By your side in crisis
  ["Stays calm under pressure", "Would drop everything to help", "The strongest person here", "Already proved it before"],
  // Q48: Most loyal
  ["Would never switch up on you", "Has your back no matter what", "Been loyal since day one", "Loyalty is their whole personality"],
  // Q49: Best style
  ["Always looks good no matter what", "Effortlessly stylish", "Everyone copies their outfits", "Fashion icon of the group"],
  // Q50: Best parent
  ["Most patient person here", "Would give their kid the best life", "Already acts like a parent", "Has the perfect balance of fun and discipline"],
  // Q51: Most hardworking
  ["Never stops grinding", "Works harder than everyone combined", "Their work ethic is insane", "Success is coming for them 100%"],
  // Q52: Most genuine
  ["What you see is what you get", "Never puts on an act", "Honest to a fault", "The most real person in the group"],
  // Q53: Lights up the room
  ["Energy changes when they walk in", "Everyone's mood lifts around them", "Natural charisma", "The life of every gathering"],
  // Q54: Business partner
  ["Smart and trustworthy combo", "Would actually make money together", "Best work ethic + brains", "Already thinks like an entrepreneur"],
  // Q55: Best humor
  ["Comedy comes naturally to them", "Even their serious moments are funny", "Group chat MVP", "Would survive as a stand-up comedian"],
  // Q56: Smartest
  ["Book smart and street smart", "Knows something about everything", "The one everyone asks for help", "Brain works different from everyone else"],
  // Q57: Call at 3 AM
  ["Would actually pick up", "No judgment, just support", "Already done it before", "The only one you'd trust at that hour"],
  // Q58: Deserves most happiness
  ["Been through the most and still smiles", "Never complains about anything", "Always puts others first", "The universe owes them big time"],
  // Q59: Changed the most
  ["Completely different person now", "Growth is real and visible", "Used to be worse, now they're great", "The glow up is real"],
  // Q60: Most underrated
  ["People don't appreciate them enough", "Does so much without recognition", "Quiet but carries the group", "Deserves way more credit"],
  // Q61: Stuck on island with
  ["Would keep you alive AND entertained", "Best survival skills", "Wouldn't go crazy being stuck with them", "The most chill person here"],
  // Q62: Glue of the group
  ["Without them the group falls apart", "Always brings everyone together", "The peacemaker", "Plans everything and holds it down"],
  // EXTREME NEGATIVE Q63-Q82
  // Q63: Most manipulative
  ["Controls people without them knowing", "Always has a hidden motive", "Plays mind games for fun", "You never know their real intentions"],
  // Q64: Never date
  ["Red flags on red flags", "Would ruin your life", "Worst partner energy ever", "Already proved they can't handle relationships"],
  // Q65: Toxic trait they won't fix
  ["Everyone's told them but they don't care", "It's getting worse not better", "They think it's a personality not a problem", "Will never change at this point"],
  // Q66: Vote out of group
  ["Group would be better without them", "Creates more problems than they solve", "Nobody would actually miss them", "Everyone thinks it but won't say it"],
  // Q67: Biggest liar
  ["Believes their own lies", "Lies about things that don't even matter", "Can't tell the difference between truth and fiction", "Their version of events is always different"],
  // Q68: Stab and smile
  ["Would betray you and act like nothing happened", "Has done it before and will again", "Smiles to your face, plots behind your back", "The definition of snake"],
  // Q69: Secretly most irritating
  ["Small things they do drive you crazy", "You tolerate them out of politeness", "Gets worse the more time you spend with them", "Everyone feels it but nobody says it"],
  // Q70: Most negative energy
  ["Complains about everything", "Kills the vibe every time", "Always has something negative to say", "The group downer"],
  // Q71: Needs therapy most
  ["Unresolved issues are showing", "Takes it out on everyone else", "In denial about their problems", "Everyone can see it except them"],
  // Q72: Most selfish
  ["Everything is always about them", "Never considers anyone else's feelings", "Takes but never gives", "Would choose themselves over anyone every time"],
  // Q73: Throw under the bus
  ["Self-preservation above all", "Has done it before", "Would sacrifice anyone to save face", "Zero shame about it either"],
  // Q74: Worst attitude
  ["Rude for no reason", "Acts like the world owes them", "Disrespectful and doesn't care", "Attitude problem since birth"],
  // Q75: Wouldn't trust with secret
  ["It would be public knowledge in hours", "Tells 'just one person' which becomes everyone", "Uses secrets as ammunition later", "Their mouth has no filter"],
  // Q76: Most childish
  ["Throws tantrums over nothing", "Can't handle adult conversations", "Refuses to take responsibility", "Still acts like they're 12"],
  // Q77: Makes everything about themselves
  ["Your problem becomes their bigger problem", "Can't let anyone else have a moment", "Main character syndrome extreme edition", "Hijacks every conversation"],
  // Q78: Most annoying habit
  ["Does it constantly and doesn't realize", "Everyone notices but nobody says anything", "It's become their signature cringe move", "Impossible to ignore"],
  // Q79: Worst roommate
  ["Would never clean anything", "Zero respect for shared space", "Loud at the worst times", "Would make your life miserable"],
  // Q80: Talks most says least
  ["Never shuts up but says nothing meaningful", "Loves the sound of their own voice", "Could talk for hours about absolutely nothing", "Quantity over quality always"],
  // Q81: Most high maintenance
  ["Everything has to be perfect for them", "Takes 3 hours to get ready", "Complains if things aren't exactly their way", "Being their friend is a full-time job"],
  // Q82: First to forget birthday
  ["Doesn't even know when it is", "Too self-absorbed to remember", "Would forget even with a reminder", "Only remembers their own birthday"],
  // FAMILY — second child per person
  // Bia's parents pick
  ["Way more respectful than Bia", "Bia's parents already love them more", "Would be the golden child instantly", "Bia would be jealous of the attention"],
  // Kamran's parents pick
  ["More responsible than Kamran", "Kamran's parents need someone calmer", "Would actually help around the house", "Kamran would feel replaced immediately"],
  // Shamama's parents pick
  ["Less dramatic than Shamama", "Shamama's parents want some peace", "Would balance out Shamama's energy", "The family needs this person's vibe"],
  // Arsal's parents pick
  ["More organized than Arsal", "Arsal's parents deserve better", "Would actually listen to the parents", "Arsal would get competitive with them"],
  // Sabrina's parents pick
  ["More chill than Sabrina", "Sabrina's parents want a low-maintenance kid", "Would bring good energy to the family", "Sabrina would secretly love having them around"],
  // Shazil's parents pick
  ["More mature than Shazil", "Shazil's parents need someone reliable", "Would keep Shazil in check", "The family upgrade they deserve"],
  // Alina's parents pick
  ["More easygoing than Alina", "Alina's parents want less stress", "Would actually be on time to family events", "Alina would either love or hate them"],
  // Q90: Most spoiled kids
  ["Already spoils themselves", "Can't say no to anyone", "Would buy their kid everything", "Their kid would be a nightmare"],
  // Q91: Strictest parent
  ["Already acts like a dictator", "Has too many rules for themselves", "Zero tolerance for nonsense", "Their kid would rebel hard"],
  // Q92: Let kids do anything
  ["Too lazy to discipline", "Wants to be the cool parent", "Can't even control themselves", "Would be their kid's best friend not parent"],
  // Q93: Most well-behaved kids
  ["Has the best values", "Would actually put in the effort", "Leads by example", "Their patience is unmatched"],
  // Q94: Embarrassing parent
  ["Already embarrasses the group", "Would try too hard to be cool", "Would show up in the most extra outfit", "Would tell their kid's friends embarrassing stories"],
  // Q95: Ridiculous kid name
  ["Already has weird taste in everything", "Would pick a celebrity name", "Would spell a normal name wrong on purpose", "Would name their kid after a character"],
  // RELATIONSHIPS
  // Q96: Falls in love fastest
  ["Catches feelings after one conversation", "Heart on their sleeve 24/7", "Falls for everyone they meet", "Already in love with someone right now probably"],
  // Q97: Married first
  ["Already planning their wedding", "Can't survive being single", "Most ready for commitment", "Has their future spouse picked out already"],
  // Q98: Divorced first
  ["Can't commit to anything", "Would get bored immediately", "Too many red flags for marriage", "Would marry the wrong person on purpose"],
  // Q99: Most clingy
  ["Texts 100 times a day", "Can't be alone for 5 minutes", "Gets upset if you don't reply instantly", "Would track their partner's location"],
  // Q100: Worst relationship advice
  ["Their own love life is a disaster", "Gives advice they'd never follow", "Always says 'just break up'", "Has zero emotional intelligence"],
  // Q101: Would cheat first
  ["Can't resist attention from others", "Has wandering eyes already", "Loyalty isn't their strong suit", "Would blame the other person somehow"],
  // Q102: Biggest simp
  ["Would do anything for a crush", "Loses all self-respect when they like someone", "Puts their crush on a pedestal", "Simping is their full-time job"],
  // Q103: High standards but shouldn't
  ["Their standards don't match what they offer", "Wants a 10 but gives a 3", "Picky about everything but themselves", "Delusional about their own worth"],
  // Q104: Stay in toxic relationship longest
  ["Afraid of being alone", "Makes excuses for bad behavior", "Thinks they can fix people", "Has already done it before"],
  // Q105: Stalk ex's social media
  ["Checks their ex daily already", "Would create a fake account to watch", "Can't let go of the past", "Knows their ex's every move"],
  // Q106: Catches feelings easiest
  ["One compliment and they're gone", "Falls for anyone who's nice to them", "Emotionally available to a fault", "Already crushing on someone right now"],
  // Q107: Date friend's ex
  ["Has no boundaries", "Would justify it somehow", "Attraction over loyalty", "Has thought about it already"],
  // Q108: Most romantic
  ["Knows how to make someone feel special", "Would plan the perfect date", "Hopeless romantic at heart", "Their partner would be the luckiest"],
  // Q109: Best boyfriend/girlfriend
  ["Caring, loyal, and fun", "Would actually put in effort", "Knows how to communicate", "The full package honestly"],
];

const COLORS = [
  "from-red-600 to-red-700", "from-orange-600 to-orange-700", "from-amber-600 to-amber-700",
  "from-emerald-600 to-emerald-700", "from-blue-600 to-blue-700", "from-purple-600 to-purple-700",
  "from-pink-600 to-pink-700",
];

type GameState = { status: "lobby" | "question" | "final"; currentQuestion: number; totalQuestions: number; kickVersion: number; questionOrder: number[] };

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
  const [game, setGame] = useState<GameState>({ status: "lobby", currentQuestion: 0, totalQuestions: 74, kickVersion: 1, questionOrder: [] });
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
                {(WHY_PER_QUESTION[game.questionOrder?.[game.currentQuestion] ?? game.currentQuestion] || []).map((opt) => (
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
