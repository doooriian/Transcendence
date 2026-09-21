import {
  createGame,
  joinGame,
  leaveGame,
  getActiveGameByUser,
  getGameState,
  getLegalMoves,
  makeGameMove,
} from "../services/gameService.js";

const DISCONNECT_GRACE_MS = 60_000;
const disconnectTimers = new Map();

/**
 * Creates a game, joins the creator to its Socket.IO room,
 * and emits "game:created" with the created game to that socket.
 */
function handleGameCreate(socket) {
  const authId = socket.data.authId;
  const game = createGame(authId);

  if (!game) {
    socket.emit("game:error", { message: "You already have an active game" });
    return;
  }

  const gameState = getGameState(game.id, authId);

  socket.join(`game:${game.id}`);
  socket.emit("game:created", gameState);
}

/**
 * Sends the authenticated user's active game to the frontend.
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
 * Tries to join an existing game.
 * Emits "game:error" to the joining socket on failure.
 * On success, joins the game room and emits "game:ready" with the game to both players.
 */
function handleGameJoin(io, socket, gameId) {
  const authId = socket.data.authId;
  const game = joinGame(gameId, authId);

  if (!game) {
    socket.emit("game:error", { message: "Unable to join the game" });
    return;
  }

  const gameState = getGameState(game.id, authId);

  socket.join(`game:${game.id}`);
  io.to(`game:${game.id}`).emit("game:ready", gameState);
}

function handleGetLegalMoves(socket, data) {
  const authId = socket.data.authId;

  const legalMoves = getLegalMoves(data.gameId, authId, data.startingSquare);

  if (!legalMoves) {
    socket.emit("game:error", { message: "Unable to get legal moves" });
    return;
  }

  socket.emit("game:legal-moves", {
    startingSquare: data.startingSquare,
    legalMoves,
  });
}

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

  io.to(`game:${data.gameId}`).emit("game:updated", gameState);
}

/**
 * Tries to remove a player from an existing game.
 * Emits "game:error" to the leaving socket if the user is not allowed to leave.
 * On success, emits "game:ended" to the room and removes all sockets from it.
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
 * Cancels the pending game disconnect timeout for a user.
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
 * Starts a grace period for a disconnected user.
 * Ends the active game if the user does not reconnect before the timeout.
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

    const endedGame = leaveGame(gameId, authId);

    if (!endedGame) {
      return;
    }

    cancelGameDisconnect(endedGame.white);

    if (endedGame.black) {
      cancelGameDisconnect(endedGame.black);
    }

    const room = `game:${gameId}`;

    io.to(room).emit("game:ended");
    io.in(room).socketsLeave(room);
  }, DISCONNECT_GRACE_MS);

  disconnectTimers.set(authId, timer);
}

/**
 * Registers all game-related Socket.IO listeners for one authenticated socket.
 * Automatically restores the socket to its active game room if necessary.
 */
function registerGameHandlers(io, socket) {
  const authId = socket.data.authId;
  const activeGame = getActiveGameByUser(authId);

  if (activeGame) {
    socket.join(`game:${activeGame.id}`);
  }

  socket.on("game:create", () => handleGameCreate(socket));

  socket.on("game:get-active", () => handleGetActiveGame(socket));

  socket.on("game:join", (gameId) => handleGameJoin(io, socket, gameId));

  socket.on("game:get-legal-moves", (data) =>
    handleGetLegalMoves(socket, data),
  );

  socket.on("game:move", (data) => handleGameMove(io, socket, data));

  socket.on("game:leave", (gameId) => handleGameLeave(io, socket, gameId));
}

export { cancelGameDisconnect, scheduleGameDisconnect };

export default registerGameHandlers;
