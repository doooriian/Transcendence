import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chooseBotMove } from "../src/games/chess/stockfish.bot.js";
import {
  createGame, joinGame, makeGameMove, makeBotMove, getGameState,
  resignGame, finishGame, getActiveGameByUser,
} from "../src/services/gameService.js";

const fixture = fileURLToPath(new URL("./fixtures/uci-engine.cjs", import.meta.url));
const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
const transport = (mode, extra = {}) => ({ executable: process.execPath, args: [fixture, mode], ...extra });

test("UCI handshake, bestmove and promotion parsing", async () => {
  assert.deepEqual(await chooseBotMove(fen, "easy", transport("normal")), {
    startingSquare: "e7", targetSquare: "e5", promotionChessPieceType: null,
  });
  assert.equal((await chooseBotMove(fen, "hard", transport("promotion"))).promotionChessPieceType, "queen");
});

test("unavailable engines, timeouts and cancellation reject without hanging", async () => {
  await assert.rejects(chooseBotMove(fen, "medium", { executable: "missing-stockfish-test-executable" }), /unavailable/);
  await assert.rejects(chooseBotMove(fen, "medium", transport("silent", { timeoutMs: 100 })), /timed out/);
  const controller = new AbortController();
  const pending = chooseBotMove(fen, "medium", transport("silent", { signal: controller.signal }));
  controller.abort();
  await assert.rejects(pending, /cancelled/);
});

test("bot games enforce identity and turns, and can be finished and recreated", async () => {
  const game = createGame("bot-player", { mode: "bot", difficulty: "hard" });
  assert.equal(createGame("invalid-player", { mode: "bot", difficulty: "invalid" }), null);
  assert.equal(joinGame(game.id, "other-player"), null);
  assert.equal(makeGameMove(game.id, game.black, { startingSquare: "e7", targetSquare: "e5" }), null);
  assert.equal(makeGameMove(game.id, "bot-player", { startingSquare: "e2", targetSquare: "e4" }).moveWasSuccessful, true);
  assert.equal(makeGameMove(game.id, "bot-player", { startingSquare: "d2", targetSquare: "d4" }), null);
  await makeBotMove(game.id, "bot-player", () => chooseBotMove(fen, "hard", transport("normal")));
  assert.equal(getGameState(game.id, "bot-player").chess.currentPlayerColor, "white");
  assert.equal(getGameState(game.id, "bot-player").chess.moveHistory.length, 2);
  resignGame(game.id, "bot-player");
  finishGame(game.id);
  assert.equal(getActiveGameByUser("bot-player"), null);
  const next = createGame("bot-player");
  assert.equal(next.black, null);
});

test("abandoning a game discards an in-flight move and duplicate searches", async () => {
  const game = createGame("cancel-player", { mode: "bot" });
  makeGameMove(game.id, "cancel-player", { startingSquare: "e2", targetSquare: "e4" });
  let complete;
  const pending = makeBotMove(game.id, "cancel-player", () => new Promise(resolve => { complete = resolve; }));
  assert.equal(await makeBotMove(game.id, "cancel-player"), null);
  resignGame(game.id, "cancel-player");
  finishGame(game.id);
  complete({ startingSquare: "e7", targetSquare: "e5" });
  assert.equal(await pending, null);
  assert.equal(getActiveGameByUser("cancel-player"), null);
});

test("an illegal engine reply leaves the position intact and permits retry", async () => {
  const game = createGame("retry-player", { mode: "bot" });
  makeGameMove(game.id, "retry-player", { startingSquare: "e2", targetSquare: "e4" });
  await assert.rejects(makeBotMove(game.id, "retry-player", async () => ({ startingSquare: "e7", targetSquare: "e4" })), /illegal/);
  assert.equal(getGameState(game.id, "retry-player").chess.moveHistory.length, 1);
  await makeBotMove(game.id, "retry-player", async () => ({ startingSquare: "e7", targetSquare: "e5" }));
  assert.equal(getGameState(game.id, "retry-player").chess.moveHistory.length, 2);
  resignGame(game.id, "retry-player");
  finishGame(game.id);
});

test("bot checkmate ends the game, while human multiplayer still alternates turns", async () => {
  const botGame = createGame("mate-player", { mode: "bot" });
  makeGameMove(botGame.id, "mate-player", { startingSquare: "f2", targetSquare: "f3" });
  await makeBotMove(botGame.id, "mate-player", async () => ({ startingSquare: "e7", targetSquare: "e5" }));
  makeGameMove(botGame.id, "mate-player", { startingSquare: "g2", targetSquare: "g4" });
  await makeBotMove(botGame.id, "mate-player", async () => ({ startingSquare: "d8", targetSquare: "h4" }));
  const state = getGameState(botGame.id, "mate-player");
  assert.equal(state.chess.chessGameEndReason, "checkmate");
  assert.equal(state.chess.chessGameResult, "blackPlayerWon");
  assert.equal(await makeBotMove(botGame.id, "mate-player"), null);
  finishGame(botGame.id);

  const humanGame = createGame("human-white");
  joinGame(humanGame.id, "human-black");
  assert.equal(makeGameMove(humanGame.id, "human-white", { startingSquare: "e2", targetSquare: "e4" }).moveWasSuccessful, true);
  assert.equal(await makeBotMove(humanGame.id, "human-white"), null);
  assert.equal(makeGameMove(humanGame.id, "human-black", { startingSquare: "e7", targetSquare: "e5" }).moveWasSuccessful, true);
  resignGame(humanGame.id, "human-black");
  finishGame(humanGame.id);
});
