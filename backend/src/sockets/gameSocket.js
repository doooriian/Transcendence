import {
  createGame,
  joinGame,
  getActiveGameByUser,
  getGameState,
  getLegalMoves,
  makeGameMove,
  resignGame,
  leaveGame,
  finishGame,
} from "../services/gameService.js";

const DISCONNECT_GRACE_MS = 60_000;
const disconnectTimers = new Map();

/**
 * Creates a game for the authenticated user.
 * Joins all sockets of the user to the game room and emits the initial game state.
 */
function handleGameCreate(io, socket) {
  const authId = socket.data.authId;
  const game = createGame(authId);

  if (!game) {
    socket.emit("game:error", { message: "You already have an active game" });
    return;
  }

  const gameState = getGameState(game.id, authId);

  io.in(`user:${authId}`).socketsJoin(`game:${game.id}`);
  socket.emit("game:created", gameState);
}

/**
 * Attempts to join an existing game as black.
 * On success, joins all sockets of the user to the game room
 * and sends the complete game state to both players.
 */
function handleGameJoin(io, socket, gameId) {
  const authId = socket.data.authId;
  const game = joinGame(gameId, authId);

  if (!game) {
    socket.emit("game:error", { message: "Unable to join the game" });
    return;
  }

  const gameState = getGameState(game.id, authId);

  io.in(`user:${authId}`).socketsJoin(`game:${game.id}`);
  io.to(`game:${game.id}`).emit("game:ready", gameState);
}

/**
 * Sends the authenticated user's active game state.
 * Emits null if the user has no active game.
 */
function handleGetActiveGame(socket) {
  const authId = socket.data.authId;
  const game = getActiveGameByUser(authId);

  if (!game) {
    socket.emit("game:active", null);
    return;
  }

  const gameState = getGameState(game.id, authId);

  socket.emit("game:active", gameState);
}

/**
 * Requests the legal moves for a selected square.
 * Sends the legal moves back to the requesting socket.
 */
function handleGetLegalMoves(socket, data) {
  const authId = socket.data.authId;

  const legalMoves = getLegalMoves(data.gameId, authId, data.startingSquare);

  if (!legalMoves) {
    socket.emit("game:error", { message: ""});
    return;
  }

  socket.emit("game:legal-moves", {
    startingSquare: data.startingSquare,
    legalMoves,
  });
}

/**
 * Attempts to apply a move for the authenticated player.
 * Broadcasts the updated game state, or ends and cleans up the game
 * if the move finishes the chess match.
 */
function handleGameMove(io, socket, data) {
  const authId = socket.data.authId;

  const result = makeGameMove(data.gameId, authId, data.move);

  if (!result) {
    socket.emit("game:error", { message: "Unable to make move" });
    return;
  }

  if (!result.moveWasSuccessful) {
    socket.emit("game:error", { message: result.errorMessage });
    return;
  }

  const gameState = getGameState(data.gameId, authId);

  if (gameState.chess.isGameFinished) {
    const endedGame = finishGame(data.gameId);

    if (!endedGame) {
      return;
    }

    cancelGameDisconnect(endedGame.white);

    if (endedGame.black) {
      cancelGameDisconnect(endedGame.black);
    }

    const room = `game:${data.gameId}`;

    io.to(room).emit("game:ended", gameState);
    io.in(room).socketsLeave(room);

    return;
  }

  io.to(`game:${data.gameId}`).emit("game:updated", gameState);
}

/**
 * Resigns the active game for the authenticated player.
 * Broadcasts the final game state and removes all sockets from the game room.
 */
function handleGameResign(io, socket, gameId) {
  const authId = socket.data.authId;

  const result = resignGame(gameId, authId);

  if (!result || !result.resignationWasSuccessful) {
    socket.emit("game:error", { message: "Unable to resign game" });
    return;
  }

  const gameState = getGameState(gameId, authId);

  const endedGame = finishGame(gameId);

  if (!endedGame) {
    return;
  }

  cancelGameDisconnect(endedGame.white);

  if (endedGame.black) {
    cancelGameDisconnect(endedGame.black);
  }

  const room = `game:${gameId}`;

  io.to(room).emit("game:ended", gameState);
  io.in(room).socketsLeave(room);
}

/**
 * Cancels a game that has not started yet.
 * Cleans up disconnect timers and removes all sockets from the game room.
 */
function handleGameLeave(io, socket, gameId) {
  const authId = socket.data.authId;
  const game = leaveGame(gameId, authId);

  if (!game) {
    socket.emit("game:error", { message: "Unable to leave the game" });
    return;
  }

  cancelGameDisconnect(game.white);

  if (game.black) {
    cancelGameDisconnect(game.black);
  }

  const room = `game:${gameId}`;

  io.to(room).emit("game:ended");
  io.in(room).socketsLeave(room);
}

/**
 * Cancels the pending disconnect timeout for a user.
 */
function cancelGameDisconnect(authId) {
  const timer = disconnectTimers.get(authId);

  if (!timer) {
    return;
  }

  clearTimeout(timer);
  disconnectTimers.delete(authId);
}

/**
 * Starts a grace period when a user disconnects.
 * If the user does not reconnect, cancels a waiting game
 * or treats the disconnect as a resignation for an active game.
 */
function scheduleGameDisconnect(io, authId) {
  const game = getActiveGameByUser(authId);

  if (!game || disconnectTimers.has(authId)) {
    return;
  }

  const gameId = game.id;

  const timer = setTimeout(() => {
    disconnectTimers.delete(authId);

    const activeGame = getActiveGameByUser(authId);

    if (!activeGame || activeGame.id !== gameId) {
      return;
    }

    let endedGame;
    let gameState = null;

    if (activeGame.black) {
      const result = resignGame(gameId, authId);

      if (!result || !result.resignationWasSuccessful) {
        return;
      }

      gameState = getGameState(gameId, authId);
      endedGame = finishGame(gameId);
    } else {
      endedGame = leaveGame(gameId, authId);
    }

    if (!endedGame) {
      return;
    }

    cancelGameDisconnect(endedGame.white);

    if (endedGame.black) {
      cancelGameDisconnect(endedGame.black);
    }

    const room = `game:${gameId}`;

    io.to(room).emit("game:ended", gameState);
    io.in(room).socketsLeave(room);
  }, DISCONNECT_GRACE_MS);

  disconnectTimers.set(authId, timer);
}

/**
 * Registers all game-related Socket.IO events for an authenticated socket.
 * Restores the socket to its active game room when reconnecting.
 */
function registerGameHandlers(io, socket) {
  const authId = socket.data.authId;
  const activeGame = getActiveGameByUser(authId);

  if (activeGame) {
    socket.join(`game:${activeGame.id}`);
  }

  socket.on("game:create", () => handleGameCreate(io, socket));

  socket.on("game:join", (gameId) => handleGameJoin(io, socket, gameId));

  socket.on("game:get-active", () => handleGetActiveGame(socket));

  socket.on("game:get-legal-moves", (data) =>
    handleGetLegalMoves(socket, data),
  );

  socket.on("game:move", (data) => handleGameMove(io, socket, data));

  socket.on("game:resign", (gameId) => handleGameResign(io, socket, gameId));

  socket.on("game:leave", (gameId) => handleGameLeave(io, socket, gameId));
}

export { cancelGameDisconnect, scheduleGameDisconnect };

export default registerGameHandlers;
