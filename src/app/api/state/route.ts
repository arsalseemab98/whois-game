import { NextResponse } from "next/server";

type Vote = {
  voterId: string; // unique player ID, not name
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

const state = {
  game: {
    status: "lobby" as "lobby" | "question" | "final",
    currentQuestion: 0,
    totalQuestions: 35,
    kickVersion: 1,
  },
  votes: [] as Vote[],
  players: [] as Player[],
};

// Remove players not seen in 20 seconds (heartbeat is every 5s)
function cleanStalePlayers() {
  const now = Date.now();
  state.players = state.players.filter((p) => now - p.lastSeen < 20000);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "game") {
    return NextResponse.json(state.game);
  }
  if (type === "votes") {
    const q = searchParams.get("question");
    if (q !== null) {
      const filtered = state.votes.filter((v) => v.question === parseInt(q));
      return NextResponse.json({ votes: filtered });
    }
    return NextResponse.json({ votes: state.votes });
  }
  if (type === "players") {
    cleanStalePlayers();
    return NextResponse.json({
      players: state.players.map((p) => ({ id: p.id, name: p.name })),
      count: state.players.length,
    });
  }

  return NextResponse.json(state);
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
      state.votes.length = 0;
      state.players.length = 0;
    }
    return NextResponse.json(state.game);
  }

  if (body.type === "vote") {
    // Dedup by player ID + question (NOT by name — fixes anonymous bug)
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
    return NextResponse.json({ ok: true, totalVotes: state.votes.length });
  }

  // Player join / heartbeat
  if (body.type === "player") {
    const id = body.id || String(Date.now());
    const name = body.name || "Anonymous";
    const existing = state.players.find((p) => p.id === id);
    if (existing) {
      existing.lastSeen = Date.now();
      existing.name = name; // allow name updates
    } else {
      state.players.push({ id, name, lastSeen: Date.now() });
    }
    return NextResponse.json({
      players: state.players.map((p) => ({ id: p.id, name: p.name })),
      count: state.players.length,
    });
  }

  return NextResponse.json({ error: "unknown type" }, { status: 400 });
}
