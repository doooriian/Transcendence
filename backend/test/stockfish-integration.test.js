import test from "node:test";
import assert from "node:assert/strict";
import ChessEngine from "../src/games/chess/chess.engine.js";
import { chooseBotMove } from "../src/games/chess/stockfish.bot.js";
import registerGameHandlers from "../src/sockets/gameSocket.js";

const enabled = Boolean(process.env.STOCKFISH_PATH);

test("real Stockfish returns legal moves at every difficulty and promotes", { skip: !enabled }, async () => {
  for (const difficulty of ["easy", "medium", "hard"]) {
    const engine = new ChessEngine();
    engine.makeMove({ startingSquare: "e2", targetSquare: "e4" });
    const move = await chooseBotMove(engine.getCurrentPositionFen(), difficulty);
    assert.equal(engine.makeMove(move).moveWasSuccessful, true);
  }
  // The king has no legal square, so every legal reply is a promotion.
  const engine = new ChessEngine("7k/5K2/6Q1/8/8/8/p7/8 b - - 0 1");
  const move = await chooseBotMove(engine.getCurrentPositionFen(), "hard");
  assert.ok(move.promotionChessPieceType);
  assert.equal(engine.makeMove(move).moveWasSuccessful, true);
});

test("Socket.IO handlers broadcast the human move then the real bot reply", { skip: !enabled }, async () => {
  const handlers = new Map();
  const events = [];
  const socket = {
    data: { authId: "socket-bot-player" },
    on: (name, handler) => handlers.set(name, handler),
    emit: (name, data) => events.push({ name, data }),
    join() {},
  };
  const io = {
    in: () => ({ socketsJoin() {}, socketsLeave() {} }),
    to: () => ({ emit: socket.emit }),
  };
  registerGameHandlers(io, socket);
  handlers.get("game:create")({ mode: "bot", difficulty: "easy" });
  const game = events.find(event => event.name === "game:created").data;
  handlers.get("game:move")({ gameId: game.id, move: { startingSquare: "e2", targetSquare: "e4" } });
  const deadline = Date.now() + 12_000;
  while (!events.some(event => event.name === "game:updated" && event.data.chess.moveHistory.length === 2)) {
    assert.ok(Date.now() < deadline, "Bot reply was not broadcast");
    assert.equal(events.some(event => event.name === "game:bot-error"), false);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(events.filter(event => event.name === "game:updated").length, 2);
  handlers.get("game:resign")(game.id);
  assert.equal(events.at(-1).name, "game:ended");
  assert.equal(events.at(-1).data.chess.chessGameResult, "blackPlayerWon");
});
