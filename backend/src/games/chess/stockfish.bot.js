import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

export const BOT_DIFFICULTIES = Object.freeze({
  easy: { skill: 0, moveTime: 150 },
  medium: { skill: 8, moveTime: 400 },
  hard: { skill: 20, moveTime: 1000 },
});

let activeSearches = 0;
const PROMOTIONS = { q: "queen", r: "rook", b: "bishop", n: "knight" };

/** One isolated UCI process per search, with bounded CPU, memory and lifetime. */
export function chooseBotMove(fen, difficulty, {
  signal,
  executable = process.env.STOCKFISH_PATH || "stockfish",
  args = [],
  timeoutMs = 10_000,
} = {}) {
  const settings = BOT_DIFFICULTIES[difficulty];
  if (!settings || typeof fen !== "string" || /[\r\n]/.test(fen)) {
    return Promise.reject(new Error("Invalid bot search"));
  }
  if (signal?.aborted) return Promise.reject(new Error("Bot search cancelled"));
  if (activeSearches >= 4) return Promise.reject(new Error("Bot engines are busy; please retry"));

  activeSearches++;
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    const lines = createInterface({ input: child.stdout });
    let settled = false;
    let phase = "uci";
    const timer = setTimeout(() => finish(new Error("Stockfish search timed out")), timeoutMs);
    const abort = () => finish(new Error("Bot search cancelled"));

    function finish(error, move) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      lines.close();
      child.kill();
      activeSearches--;
      if (error) reject(error);
      else resolve(move);
    }

    function send(command) {
      if (!settled) child.stdin.write(`${command}\n`);
    }

    signal?.addEventListener("abort", abort, { once: true });
    child.on("error", () => finish(new Error("Stockfish is unavailable")));
    child.on("exit", () => finish(new Error("Stockfish exited before choosing a move")));
    child.stdin.on("error", () => finish(new Error("Stockfish input failed")));
    child.stderr.resume();
    lines.on("line", (line) => {
      if (line === "uciok" && phase === "uci") {
        phase = "ready";
        send("setoption name Threads value 1");
        send("setoption name Hash value 16");
        send(`setoption name Skill Level value ${settings.skill}`);
        send("ucinewgame");
        send("isready");
      } else if (line === "readyok" && phase === "ready") {
        phase = "search";
        send(`position fen ${fen}`);
        send(`go movetime ${settings.moveTime}`);
      } else if (line.startsWith("bestmove ") && phase === "search") {
        const match = /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?(?:\s|$)/.exec(line);
        if (!match) return finish(new Error("Stockfish returned no valid move"));
        finish(null, {
          startingSquare: match[1],
          targetSquare: match[2],
          promotionChessPieceType: PROMOTIONS[match[3]] ?? null,
        });
      }
    });
    send("uci");
  });
}
