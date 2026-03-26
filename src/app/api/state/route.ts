import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

let _redis: Redis | null = null;
function getRedis() {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

const STATE_KEY = "whois:state";

type Vote = { voterId: string; voter: string; question: number; target: string; reason: string };
type Player = { id: string; name: string; lastSeen: number };
const TOTAL_QUESTIONS = 74;

type State = {
  game: {
    status: "lobby" | "question" | "final";
    currentQuestion: number;
    totalQuestions: number;
    kickVersion: number;
    questionOrder: number[]; // shuffled indices
  };
  votes: Vote[];
  players: Player[];
};

function shuffleArray(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function defaultState(): State {
  return {
    game: { status: "lobby", currentQuestion: 0, totalQuestions: TOTAL_QUESTIONS, kickVersion: 1, questionOrder: shuffleArray(TOTAL_QUESTIONS) },
    votes: [],
    players: [],
  };
}

async function loadState(): Promise<State> {
  try {
    const data = await getRedis().get<State>(STATE_KEY);
    if (data) return data;
  } catch { /* first run or corrupted */ }
  return defaultState();
}

async function saveState(state: State) {
  await getRedis().set(STATE_KEY, state);
}

function cleanStalePlayers(state: State) {
  const now = Date.now();
  state.players = state.players.filter((p) => now - p.lastSeen < 20000);
}

function noCacheHeaders() {
  return { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", Pragma: "no-cache" };
}

export async function GET(request: Request) {
  const state = await loadState();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "game") {
    return NextResponse.json(state.game, { headers: noCacheHeaders() });
  }
  if (type === "votes") {
    const q = searchParams.get("question");
    if (q !== null) {
      const filtered = state.votes.filter((v) => v.question === parseInt(q));
      return NextResponse.json({ votes: filtered }, { headers: noCacheHeaders() });
    }
    return NextResponse.json({ votes: state.votes }, { headers: noCacheHeaders() });
  }
  if (type === "players") {
    cleanStalePlayers(state);
    await saveState(state);
    return NextResponse.json({
      players: state.players.map((p) => ({ id: p.id, name: p.name })),
      count: state.players.length,
    }, { headers: noCacheHeaders() });
  }

  return NextResponse.json(state, { headers: noCacheHeaders() });
}

export async function POST(request: Request) {
  const state = await loadState();
  const body = await request.json();

  if (body.type === "game") {
    if (body.action === "start") {
      state.game.status = "question";
      state.game.currentQuestion = 0;
      state.game.questionOrder = shuffleArray(TOTAL_QUESTIONS); // new random order each game
    } else if (body.action === "next") {
      if (state.game.currentQuestion < state.game.totalQuestions - 1) {
        state.game.currentQuestion += 1;
      } else {
        state.game.status = "final";
      }
    } else if (body.action === "reset") {
      state.game.status = "lobby";
      state.game.currentQuestion = 0;
      state.game.kickVersion += 1;
      state.votes = [];
      state.players = [];
    }
    await saveState(state);
    return NextResponse.json(state.game, { headers: noCacheHeaders() });
  }

  if (body.type === "vote") {
    const voterId = body.voterId || "unknown";
    const exists = state.votes.some((v) => v.voterId === voterId && v.question === body.question);
    if (!exists) {
      state.votes.push({
        voterId,
        voter: body.voter || "Anonymous",
        question: body.question,
        target: body.target,
        reason: body.reason || "",
      });
      await saveState(state);
    }
    return NextResponse.json({ ok: true, totalVotes: state.votes.length }, { headers: noCacheHeaders() });
  }

  if (body.type === "player") {
    const id = body.id || String(Date.now());
    const name = body.name || "Anonymous";
    const existing = state.players.find((p) => p.id === id);
    if (existing) {
      existing.lastSeen = Date.now();
      existing.name = name;
    } else {
      state.players.push({ id, name, lastSeen: Date.now() });
    }
    await saveState(state);
    return NextResponse.json({
      players: state.players.map((p) => ({ id: p.id, name: p.name })),
      count: state.players.length,
    }, { headers: noCacheHeaders() });
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400, headers: noCacheHeaders() });
}
