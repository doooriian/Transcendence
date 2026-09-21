import { randomUUID } from "crypto";
import ChessEngine from "../games/chess/chess.engine.js";

const games = new Map();
const chessEngines = new Map();
const activeGameByUser = new Map();

/**
 * Creates a new game with the authenticated user as white.
 * Returns the created game object, or null if the user already has an active game.
 */
function createGame(authId) {
  if (activeGameByUser.has(authId)) {
    return null;
  }

  const game = {
    id: randomUUID(),
    white: authId,
    black: null,
  };

  const chessEngine = new ChessEngine();

  games.set(game.id, game);
  chessEngines.set(game.id, chessEngine);
  activeGameByUser.set(authId, game.id);

  return game;
}

/**
 * Adds the authenticated user as black if the game can be joined.
 * Returns the updated game object, or null if joining is not possible.
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
 * Deletes a game if the authenticated user belongs to it.
 * Returns the deleted game object, or null if leaving is not allowed.
 */
function leaveGame(gameId, authId) {
  const game = games.get(gameId);

  if (!game || (game.white !== authId && game.black !== authId)) {
    return null;
  }

  games.delete(gameId);
  chessEngines.delete(gameId);
  activeGameByUser.delete(game.white);

  if (game.black) {
    activeGameByUser.delete(game.black);
  }

  return game;
}

/**
 * Returns the active game of a user, or null if the user has no active game.
 */
function getActiveGameByUser(authId) {
  const gameId = activeGameByUser.get(authId);

  if (!gameId) {
    return null;
  }

  return games.get(gameId) ?? null;
}

function getChessEngine(gameId) {
  return chessEngines.get(gameId) ?? null;
}

function getPlayerColor(game, authId) {
  if (game.white === authId) {
    return "white";
  }

  if (game.black === authId) {
    return "black";
  }

  return null;
}

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
    chess: chessEngine.getGameState(),
  };
}

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

function makeGameMove(gameId, authId, move) {
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

export {
  createGame,
  joinGame,
  leaveGame,
  getActiveGameByUser,
  getGameState,
  getLegalMoves,
  makeGameMove,
};
