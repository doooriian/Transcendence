// Deterministic subprocess for exercising the UCI transport, not chess strategy.
const readline = require("node:readline");
const mode = process.argv[2];
readline.createInterface({ input: process.stdin }).on("line", (line) => {
  if (mode === "silent") return;
  if (line === "uci") console.log("uciok");
  if (line === "isready") console.log("readyok");
  if (line.startsWith("go ")) {
    console.log(mode === "promotion" ? "bestmove a2a1q" : "bestmove e7e5 ponder g1f3");
  }
});
