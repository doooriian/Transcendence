import { randomUUID } from "crypto";
import ChessEngine from "../games/chess/chess.engine.js";
import { BOT_DIFFICULTIES, chooseBotMove } from "../games/chess/stockfish.bot.js";

const games = new Map();
const chessEngines = new Map();
const activeGameByUser = new Map();
const botSearches = new Map();

/**
 * Creates a new game with the authenticated user as white.
 * Creates a dedicated chess engine and marks the game as active for the user.
 * Returns the created game, or null if the user already has an active game.
 */
function createGame(authId, options = {}) {
  if (!options || typeof options !== "object") {
    return null;
  }

  let mode = "human";
  if (options.mode !== null && options.mode !== undefined) {
    mode = options.mode;
  }

  let difficulty = "medium";
  if (options.difficulty !== null && options.difficulty !== undefined) {
    difficulty = options.difficulty;
  }

  if (mode !== "human" && mode !== "bot") {
    return null;
  }

  if (mode === "bot" && !Object.hasOwn(BOT_DIFFICULTIES, difficulty)) {
    return null;
  }

  if (activeGameByUser.has(authId)) {
    return null;
  }

  const game = {
    id: randomUUID(),
    white: authId,
    black: null,
    bot: null,
  };

  if (mode === "bot") {
    game.bot = { difficulty: difficulty };
    game.black = `bot:${game.id}`;
  }

  const chessEngine = new ChessEngine();

  games.set(game.id, game);
  chessEngines.set(game.id, chessEngine);
  activeGameByUser.set(authId, game.id);

  return game;
}

/**
 * Adds the authenticated user as black to an available game.
 * Returns the updated game, or null if the user cannot join it.
 */
function joinGame(gameId, authId) {
  if (activeGameByUser.has(authId)) {
    return null;
  }

  const game = games.get(gameId);

  if (!game || game.white === authId || game.black !== null) {
    return null;
  }

  game.black = authId;
  activeGameByUser.set(authId, gameId);

  return game;
}

/**
 * Returns the active game associated with a user.
 * Returns null if the user has no active game.
 */
function getActiveGameByUser(authId) {
  const gameId = activeGameByUser.get(authId);

  if (!gameId) {
    return null;
  }

  const game = games.get(gameId);
  if (game === null || game === undefined) {
    return null;
  }

  return game;
}

/**
 * Returns the complete public state of a game for one of its players.
 * Includes both session information and the current chess engine state.
 * Returns null if the game, player, or chess engine is invalid.
 */
function getGameState(gameId, authId) {
  const game = games.get(gameId);

  if (!game || !getPlayerColor(game, authId)) {
    return null;
  }

  const chessEngine = getChessEngine(gameId);

  if (!chessEngine) {
    return null;
  }

  return {
    id: game.id,
    white: game.white,
    black: game.black,
    bot: game.bot,
    chess: chessEngine.getGameState(),
  };
}

/**
 * Returns the legal moves for a square if it is the authenticated player's turn.
 * Returns null if the game is not active or the request is not allowed.
 */
function getLegalMoves(gameId, authId, startingSquare) {
  const game = games.get(gameId);

  if (!game || !game.black) {
    return null;
  }

  const playerColor = getPlayerColor(game, authId);

  if (!playerColor) {
    return null;
  }

  const chessEngine = getChessEngine(gameId);

  if (!chessEngine) {
    return null;
  }

  if (playerColor !== chessEngine.getCurrentPlayerColor()) {
    return null;
  }

  return chessEngine.getLegalMoves(startingSquare);
}

/**
 * Attempts to apply a chess move for the authenticated player.
 * Validates the game, player, and turn before delegating the move to the chess engine.
 * Returns the chess engine result, or null if the request is not allowed.
 */
function makeGameMove(gameId, authId, move) {
  if (!move || typeof move !== "object") {
    return null;
  }
  const game = games.get(gameId);

  if (!game || !game.black) {
    return null;
  }

  const playerColor = getPlayerColor(game, authId);

  if (!playerColor) {
    return null;
  }

  const chessEngine = getChessEngine(gameId);

  if (!chessEngine) {
    return null;
  }

  if (playerColor !== chessEngine.getCurrentPlayerColor()) {
    return null;
  }

  return chessEngine.makeMove(move);
}

/** Bot selection is asynchronous; only apply it to the unchanged, active game. */
async function makeBotMove(gameId, authId, selectMove = chooseBotMove) {
  const game = games.get(gameId);
  const engine = getChessEngine(gameId);
  if (!game || !game.bot) {
    return null;
  }

  if (game.white !== authId) {
    return null;
  }

  if (!engine || engine.isGameFinished()) {
    return null;
  }

  if (engine.getCurrentPlayerColor() !== "black") {
    return null;
  }

  if (botSearches.has(gameId)) {
    return null;
  }

  const fen = engine.getCurrentPositionFen();
  const controller = new AbortController();
  botSearches.set(gameId, controller);
  try {
    const move = await selectMove(fen, game.bot.difficulty, { signal: controller.signal });
    if (controller.signal.aborted) {
      return null;
    }

    if (games.get(gameId) !== game) {
      return null;
    }

    if (engine.isGameFinished()) {
      return null;
    }

    if (engine.getCurrentPositionFen() !== fen) {
      return null;
    }

    const result = engine.makeMove(move);
    if (!result.moveWasSuccessful) {
      throw new Error("Stockfish returned an illegal move");
    }

    return result;
  } finally {
    if (botSearches.get(gameId) === controller) {
      botSearches.delete(gameId);
    }
  }
}

/**
 * Resigns an active game for the authenticated player.
 * Returns the chess engine resignation result, or null if resignation is not allowed.
 */
function resignGame(gameId, authId) {
  const game = games.get(gameId);

  if (!game || !game.black) {
    return null;
  }

  const playerColor = getPlayerColor(game, authId);

  if (!playerColor) {
    return null;
  }

  const chessEngine = getChessEngine(gameId);

  if (!chessEngine) {
    return null;
  }

  return chessEngine.resign(playerColor);
}

/**
 * Cancels a game that has not started yet.
 * Only the white player may leave while no black player has joined.
 * Returns the deleted game, or null if leaving is not allowed.
 */
function leaveGame(gameId, authId) {
  const game = games.get(gameId);

  if (!game || game.black !== null || game.white !== authId) {
    return null;
  }

  return deleteGame(gameId);
}

/**
 * Deletes a game after the chess engine has marked it as finished.
 * Returns the deleted game, or null if the game is not finished.
 */
function finishGame(gameId) {
  const chessEngine = getChessEngine(gameId);

  if (!chessEngine || !chessEngine.isGameFinished()) {
    return null;
  }

  return deleteGame(gameId);
}

/**
 * Returns the chess engine associated with a game.
 * Returns null if no engine exists for the given game.
 */
function getChessEngine(gameId) {
  const chessEngine = chessEngines.get(gameId);
  if (chessEngine === null || chessEngine === undefined) {
    return null;
  }

  return chessEngine;
}

/**
 * Returns the chess color assigned to a player in a game.
 * Returns null if the user does not belong to the game.
 */
function getPlayerColor(game, authId) {
  if (game.white === authId) {
    return "white";
  }

  if (!game.bot && game.black === authId) {
    return "black";
  }

  return null;
}

/**
 * Removes a game, its chess engine, and its active-player references.
 * Returns the deleted game, or null if the game does not exist.
 */
function deleteGame(gameId) {
  const game = games.get(gameId);

  if (!game) {
    return null;
  }

  games.delete(gameId);
  chessEngines.delete(gameId);
  const controller = botSearches.get(gameId);
  if (controller !== null && controller !== undefined) {
    controller.abort();
  }
  botSearches.delete(gameId);

  activeGameByUser.delete(game.white);

  if (game.black && !game.bot) {
    activeGameByUser.delete(game.black);
  }

  return game;
}

export {
  createGame,
  joinGame,
  getActiveGameByUser,
  getGameState,
  getLegalMoves,
  makeGameMove,
  makeBotMove,
  resignGame,
  leaveGame,
  finishGame,
};
