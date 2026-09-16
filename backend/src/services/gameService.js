import { randomUUID } from "crypto";

const games = new Map();
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

  games.set(game.id, game);
  activeGameByUser.set(authId, game.id);

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
  activeGameByUser.set(authId, game.id);

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
  activeGameByUser.delete(game.white);

  if (game.black) {
    activeGameByUser.delete(game.black);
  }

  return game;
}

export { createGame, getActiveGameByUser, joinGame, leaveGame };
