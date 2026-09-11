import { randomUUID } from "crypto";

const games = new Map();

function createGame(authId) {
  const game = {
    id: randomUUID(),
    white: authId,
    black: null,
  };

  games.set(game.id, game);

  return game;
}

function getGame(gameId) {
  return games.get(gameId) ?? null;
}

function joinGame(gameId, authId) {
  const game = games.get(gameId);

  if (!game || game.white === authId || game.black !== null) {
    return null;
  }

  game.black = authId;

  return game;
}

export { createGame, getGame, joinGame };
