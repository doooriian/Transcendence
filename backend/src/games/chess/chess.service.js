import ChessEngine, {
  CHESS_COLORS,
} from "./chess.engine.js";

const CHESS_GAME_STATUS = {
  WAITING_FOR_ANOTHER_PLAYER: "waitingForAnotherPlayer",
  PLAYING: "playing",
  FINISHED: "finished",
};


class ChessService {
  constructor() {
    // Store active games in memory
    this.chessGames = new Map();

    this.nextChessGameId = 1;
  }


  // Create a new game
  createChessGame(whitePlayerId) {
    if (!whitePlayerId) {
      throw new Error("whitePlayerId is required");
    }

    const chessGameId =
      String(this.nextChessGameId++);

    const chessGame = {
      chessGameId,

      whitePlayerId,
      blackPlayerId: null,

      chessGameStatus:
        CHESS_GAME_STATUS.WAITING_FOR_ANOTHER_PLAYER,

      chessEngine:
        new ChessEngine(),
    };

    this.chessGames.set(
      chessGameId,
      chessGame
    );

    return this.getChessGameState(
      chessGameId
    );
  }


  // Add the second player
  joinChessGame(
    chessGameId,
    blackPlayerId
  ) {
    const chessGame =
      this.#getChessGameOrThrow(
        chessGameId
      );

    if (!blackPlayerId) {
      throw new Error(
        "blackPlayerId is required"
      );
    }

    if (
      chessGame.chessGameStatus
      !== CHESS_GAME_STATUS.WAITING_FOR_ANOTHER_PLAYER
    ) {
      throw new Error(
        "This chess game is not waiting for another player"
      );
    }

    if (
      chessGame.whitePlayerId
      === blackPlayerId
    ) {
      throw new Error(
        "A player cannot play against themselves"
      );
    }

    chessGame.blackPlayerId =
      blackPlayerId;

    chessGame.chessGameStatus =
      CHESS_GAME_STATUS.PLAYING;

    return this.getChessGameState(
      chessGameId
    );
  }


  // Validate the player and play the move
  makeChessMove({
    chessGameId,
    chessPlayerId,
    startingSquare,
    targetSquare,
    promotionChessPieceType = null,
  }) {
    const chessGame =
      this.#getChessGameOrThrow(
        chessGameId
      );

    if (
      chessGame.chessGameStatus
      !== CHESS_GAME_STATUS.PLAYING
    ) {
      return {
        moveWasSuccessful: false,

        errorMessage:
          "The chess game is not currently being played",
      };
    }

    const chessPlayerColor =
      this.#getChessPlayerColor(
        chessGame,
        chessPlayerId
      );

    if (chessPlayerColor === null) {
      return {
        moveWasSuccessful: false,

        errorMessage:
          "This player does not belong to this chess game",
      };
    }

    const currentPlayerColor =
      chessGame.chessEngine
        .getCurrentPlayerColor();

    if (
      chessPlayerColor
      !== currentPlayerColor
    ) {
      return {
        moveWasSuccessful: false,

        errorMessage:
          "It is not this player's turn",
      };
    }

    const moveResult =
      chessGame.chessEngine.makeMove({
        startingSquare,
        targetSquare,
        promotionChessPieceType,
      });

    if (!moveResult.moveWasSuccessful) {
      return moveResult;
    }

    if (
      chessGame.chessEngine
        .isGameFinished()
    ) {
      chessGame.chessGameStatus =
        CHESS_GAME_STATUS.FINISHED;
    }

    return {
      moveWasSuccessful: true,

      appliedChessMove:
        moveResult.appliedChessMove,

      chessGame:
        this.getChessGameState(
          chessGameId
        ),
    };
  }


  // Resign the game
  resignChessGame(
    chessGameId,
    chessPlayerId
  ) {
    const chessGame =
      this.#getChessGameOrThrow(
        chessGameId
      );

    if (
      chessGame.chessGameStatus
      !== CHESS_GAME_STATUS.PLAYING
    ) {
      return {
        resignationWasSuccessful: false,

        errorMessage:
          "The chess game is not currently being played",
      };
    }

    const chessPlayerColor =
      this.#getChessPlayerColor(
        chessGame,
        chessPlayerId
      );

    if (chessPlayerColor === null) {
      return {
        resignationWasSuccessful: false,

        errorMessage:
          "This player does not belong to this chess game",
      };
    }

    const resignationResult =
      chessGame.chessEngine.resign(
        chessPlayerColor
      );

    if (
      !resignationResult
        .resignationWasSuccessful
    ) {
      return resignationResult;
    }

    chessGame.chessGameStatus =
      CHESS_GAME_STATUS.FINISHED;

    return {
      resignationWasSuccessful: true,

      chessGame:
        this.getChessGameState(
          chessGameId
        ),
    };
  }


  // Return the public game state
  getChessGameState(chessGameId) {
    const chessGame =
      this.#getChessGameOrThrow(
        chessGameId
      );

    return {
      chessGameId:
        chessGame.chessGameId,

      whitePlayerId:
        chessGame.whitePlayerId,

      blackPlayerId:
        chessGame.blackPlayerId,

      chessGameStatus:
        chessGame.chessGameStatus,

      chessEngineState:
        chessGame.chessEngine
          .getGameState(),
    };
  }


  // Return all active games
  getAllChessGames() {
    return Array
      .from(this.chessGames.keys())
      .map(
        (chessGameId) =>
          this.getChessGameState(
            chessGameId
          )
      );
  }


  // Get a game or fail
  #getChessGameOrThrow(chessGameId) {
    const chessGame =
      this.chessGames.get(
        String(chessGameId)
      );

    if (!chessGame) {
      throw new Error(
        "Chess game not found"
      );
    }

    return chessGame;
  }


  // Find the player's chess color
  #getChessPlayerColor(
    chessGame,
    chessPlayerId
  ) {
    if (
      chessGame.whitePlayerId
      === chessPlayerId
    ) {
      return CHESS_COLORS.WHITE;
    }

    if (
      chessGame.blackPlayerId
      === chessPlayerId
    ) {
      return CHESS_COLORS.BLACK;
    }

    return null;
  }
}


const chessService =
  new ChessService();

export {
  CHESS_GAME_STATUS,
};

export default chessService;