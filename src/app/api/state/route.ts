import { NextResponse } from "next/server";

// Force dynamic — never cache this route
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Vote = {
  voterId: string;
  voter: string;
  question: number;
  target: string;
  reason: string;
};

type Player = {
  id: string;
  name: string;
  lastSeen: number;
};

// Use globalThis to survive module re-evaluations within the same instance
const globalState = globalThis as unknown as {
  __whois_state?: {
    game: { status: "lobby" | "question" | "final"; currentQuestion: number; totalQuestions: number; kickVersion: number };
    votes: Vote[];
    players: Player[];
  };
};

if (!globalState.__whois_state) {
  globalState.__whois_state = {
    game: { status: "lobby", currentQuestion: 0, totalQuestions: 35, kickVersion: 1 },
    votes: [],
    players: [],
  };
}

const state = globalState.__whois_state;

function cleanStalePlayers() {
  const now = Date.now();
  state.players = state.players.filter((p) => now - p.lastSeen < 20000);
}

function noCacheHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
  };
}

export async function GET(request: Request) {
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
    cleanStalePlayers();
    return NextResponse.json({
      players: state.players.map((p) => ({ id: p.id, name: p.name })),
      count: state.players.length,
    }, { headers: noCacheHeaders() });
  }

  return NextResponse.json(state, { headers: noCacheHeaders() });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.type === "game") {
    if (body.action === "start") {
      state.game.status = "question";
      state.game.currentQuestion = 0;
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
    return NextResponse.json(state.game, { headers: noCacheHeaders() });
  }

  if (body.type === "vote") {
    const voterId = body.voterId || "unknown";
    const exists = state.votes.some(
      (v) => v.voterId === voterId && v.question === body.question
    );
    if (!exists) {
      state.votes.push({
        voterId,
        voter: body.voter || "Anonymous",
        question: body.question,
        target: body.target,
        reason: body.reason || "",
      });
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
    return NextResponse.json({
      players: state.players.map((p) => ({ id: p.id, name: p.name })),
      count: state.players.length,
    }, { headers: noCacheHeaders() });
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400, headers: noCacheHeaders() });
}
