import assert from "node:assert/strict";

import chessService, {
  CHESS_GAME_STATUS,
} from "./chess.service.js";

import {
  CHESS_GAME_RESULT,
  CHESS_GAME_END_REASON,
} from "./chess.engine.js";

console.log("Starting chess checkmate tests...\n");


// 1. Create the game
const chessGame =
  chessService.createChessGame(10);

chessService.joinChessGame(
  chessGame.chessGameId,
  20
);

console.log("✅ Chess game created");


// 2. White: f2 -> f3
let moveResult =
  chessService.makeChessMove({
    chessGameId: chessGame.chessGameId,
    chessPlayerId: 10,
    startingSquare: "f2",
    targetSquare: "f3",
  });

assert.equal(
  moveResult.moveWasSuccessful,
  true
);

console.log("✅ White plays f2 -> f3");


// 3. Black: e7 -> e5
moveResult =
  chessService.makeChessMove({
    chessGameId: chessGame.chessGameId,
    chessPlayerId: 20,
    startingSquare: "e7",
    targetSquare: "e5",
  });

assert.equal(
  moveResult.moveWasSuccessful,
  true
);

console.log("✅ Black plays e7 -> e5");


// 4. White: g2 -> g4
moveResult =
  chessService.makeChessMove({
    chessGameId: chessGame.chessGameId,
    chessPlayerId: 10,
    startingSquare: "g2",
    targetSquare: "g4",
  });

assert.equal(
  moveResult.moveWasSuccessful,
  true
);

console.log("✅ White plays g2 -> g4");


// 5. Black: d8 -> h4 = checkmate
moveResult =
  chessService.makeChessMove({
    chessGameId: chessGame.chessGameId,
    chessPlayerId: 20,
    startingSquare: "d8",
    targetSquare: "h4",
  });

assert.equal(
  moveResult.moveWasSuccessful,
  true
);

console.log("✅ Black plays d8 -> h4");


// 6. Check game status
const finishedChessGame =
  chessService.getChessGameState(
    chessGame.chessGameId
  );

assert.equal(
  finishedChessGame.chessGameStatus,
  CHESS_GAME_STATUS.FINISHED
);

assert.equal(
  finishedChessGame
    .chessEngineState
    .isGameFinished,
  true
);

console.log("✅ Game marked as finished");


// 7. Check winner
assert.equal(
  finishedChessGame
    .chessEngineState
    .chessGameResult,
  CHESS_GAME_RESULT.BLACK_PLAYER_WON
);

assert.equal(
  finishedChessGame
    .chessEngineState
    .chessGameEndReason,
  CHESS_GAME_END_REASON.CHECKMATE
);

console.log("✅ Black wins by checkmate");


// 8. White must be in check
assert.equal(
  finishedChessGame
    .chessEngineState
    .isCurrentPlayerInCheck,
  true
);

console.log("✅ White king is in check");


// 9. Check move history
const moveHistory =
  finishedChessGame
    .chessEngineState
    .moveHistory;

assert.equal(
  moveHistory.length,
  4
);

assert.equal(
  moveHistory[3].startingSquare,
  "d8"
);

assert.equal(
  moveHistory[3].targetSquare,
  "h4"
);

assert.equal(
  moveHistory[3].chessPlyNumber,
  4
);

assert.equal(
  moveHistory[3].standardAlgebraicNotation,
  "Qh4#"
);

console.log("✅ Move history is correct");


// 10. Playing after checkmate must fail
const moveAfterCheckmate =
  chessService.makeChessMove({
    chessGameId: chessGame.chessGameId,
    chessPlayerId: 10,
    startingSquare: "e2",
    targetSquare: "e4",
  });

assert.equal(
  moveAfterCheckmate.moveWasSuccessful,
  false
);

assert.equal(
  moveAfterCheckmate.errorMessage,
  "The chess game is not currently being played"
);

console.log("✅ Move rejected after checkmate");


console.log(
  "\n✅ All chess checkmate tests passed"
);