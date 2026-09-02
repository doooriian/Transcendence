import assert from "node:assert/strict";
import chessService, {
  CHESS_GAME_STATUS,
} from "./chess.service.js";

console.log("Starting chess tests...\n");

// 1. Create the game
const createdChessGame =
  chessService.createChessGame(1);

assert.equal(
  createdChessGame.whitePlayerId,
  1
);

assert.equal(
  createdChessGame.blackPlayerId,
  null
);

assert.equal(
  createdChessGame.chessGameStatus,
  CHESS_GAME_STATUS.WAITING_FOR_ANOTHER_PLAYER
);

console.log("✅ Chess game creation");


// 2. Join the game
const joinedChessGame =
  chessService.joinChessGame(
    createdChessGame.chessGameId,
    2
  );

assert.equal(
  joinedChessGame.blackPlayerId,
  2
);

assert.equal(
  joinedChessGame.chessGameStatus,
  CHESS_GAME_STATUS.PLAYING
);

console.log("✅ Second player joins");


// 3. White plays e2 -> e4
const firstMove =
  chessService.makeChessMove({
    chessGameId:
      createdChessGame.chessGameId,
    chessPlayerId: 1,
    startingSquare: "e2",
    targetSquare: "e4",
  });

assert.equal(
  firstMove.moveWasSuccessful,
  true
);

assert.equal(
  firstMove.appliedChessMove.startingSquare,
  "e2"
);

assert.equal(
  firstMove.appliedChessMove.targetSquare,
  "e4"
);

assert.equal(
  firstMove.chessGame
    .chessEngineState
    .currentPlayerColor,
  "black"
);

console.log("✅ White plays e2 -> e4");


// 4. White tries to play again
const wrongTurnMove =
  chessService.makeChessMove({
    chessGameId:
      createdChessGame.chessGameId,
    chessPlayerId: 1,
    startingSquare: "g1",
    targetSquare: "f3",
  });

assert.equal(
  wrongTurnMove.moveWasSuccessful,
  false
);

assert.equal(
  wrongTurnMove.errorMessage,
  "It is not this player's turn"
);

console.log("✅ Player turn validation");


// 5. Black plays e7 -> e5
const secondMove =
  chessService.makeChessMove({
    chessGameId:
      createdChessGame.chessGameId,
    chessPlayerId: 2,
    startingSquare: "e7",
    targetSquare: "e5",
  });

assert.equal(
  secondMove.moveWasSuccessful,
  true
);

assert.equal(
  secondMove.chessGame
    .chessEngineState
    .currentPlayerColor,
  "white"
);

console.log("✅ Black plays e7 -> e5");


// 6. White tries an illegal move
const illegalMove =
  chessService.makeChessMove({
    chessGameId:
      createdChessGame.chessGameId,
    chessPlayerId: 1,
    startingSquare: "e4",
    targetSquare: "e6",
  });

assert.equal(
  illegalMove.moveWasSuccessful,
  false
);

assert.equal(
  illegalMove.errorMessage,
  "Illegal chess move"
);

console.log("✅ Illegal move rejected");


// 7. Black resigns
const resignation =
  chessService.resignChessGame(
    createdChessGame.chessGameId,
    2
  );

assert.equal(
  resignation.resignationWasSuccessful,
  true
);

assert.equal(
  resignation.chessGame.chessGameStatus,
  CHESS_GAME_STATUS.FINISHED
);

assert.equal(
  resignation.chessGame
    .chessEngineState
    .chessGameResult,
  "whitePlayerWon"
);

assert.equal(
  resignation.chessGame
    .chessEngineState
    .chessGameEndReason,
  "resignation"
);

console.log("✅ Resignation");

console.log("\n✅ All chess tests passed");