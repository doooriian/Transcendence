import { Chess } from "chess.js";

const CHESS_COLORS = {
  WHITE: "white",
  BLACK: "black",
};

const CHESS_GAME_RESULT = {
  WHITE_PLAYER_WON: "whitePlayerWon",
  BLACK_PLAYER_WON: "blackPlayerWon",
  DRAW: "draw",
};

const CHESS_GAME_END_REASON = {
  CHECKMATE: "checkmate",
  STALEMATE: "stalemate",
  THREEFOLD_REPETITION: "threefoldRepetition",
  INSUFFICIENT_MATERIAL: "insufficientMaterial",
  FIFTY_MOVE_RULE: "fiftyMoveRule",
  RESIGNATION: "resignation",
  AGREEMENT: "agreement",
  DRAW: "draw",
};

const PROMOTION_PIECES = new Set([
  "queen",
  "rook",
  "bishop",
  "knight",
]);

const CHESS_PIECE_TYPES = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king",
};

const CHESS_LIBRARY_PIECE_TYPES = {
  queen: "q",
  rook: "r",
  bishop: "b",
  knight: "n",
};


// Convert chess.js colors to application colors
function convertChessLibraryColor(chessLibraryColor) {
  if (chessLibraryColor === "w")
    return CHESS_COLORS.WHITE;

  if (chessLibraryColor === "b")
    return CHESS_COLORS.BLACK;

  throw new Error(`Unknown chess color: ${chessLibraryColor}`);
}


// Convert a chess.js piece to our format
function convertChessLibraryPiece(chessLibraryPiece) {
  if (!chessLibraryPiece)
    return null;

  return {
    chessPieceType: CHESS_PIECE_TYPES[chessLibraryPiece.type],
    chessPieceColor: convertChessLibraryColor(chessLibraryPiece.color),
  };
}


// Validate a square such as "e2"
function isValidChessSquare(chessSquare) {
  return (
    typeof chessSquare === "string"
    && /^[a-h][1-8]$/.test(chessSquare)
  );
}


class ChessEngine {
  #chessGame;
  #chessGameFinished;
  #chessGameResult;
  #chessGameEndReason;


  constructor(initialPositionFen = null) {
    if (
      initialPositionFen !== null
      && typeof initialPositionFen !== "string"
    ) {
      throw new TypeError(
        "initialPositionFen must be a string or null"
      );
    }

    this.#chessGame = initialPositionFen
      ? new Chess(initialPositionFen)
      : new Chess();

    this.#chessGameFinished = false;
    this.#chessGameResult = null;
    this.#chessGameEndReason = null;

    this.#updateChessGameResult();
  }


  // Return the full game state
  getGameState() {
    return {
      chessBoard: this.getChessBoard(),

      currentPlayerColor:
        convertChessLibraryColor(
          this.#chessGame.turn()
        ),

      isGameFinished: this.#chessGameFinished,

      chessGameResult: this.#chessGameResult,
      chessGameEndReason: this.#chessGameEndReason,

      isCurrentPlayerInCheck:
        this.#chessGame.isCheck(),

      currentPositionFen:
        this.#chessGame.fen(),

      moveHistory:
        this.getMoveHistory(),
    };
  }


  // Return the board in our format
  getChessBoard() {
    return this.#chessGame.board().map(
      (chessBoardRow) =>
        chessBoardRow.map(
          (chessLibraryPiece) =>
            convertChessLibraryPiece(
              chessLibraryPiece
            )
        )
    );
  }


  // Return the player whose turn it is
  getCurrentPlayerColor() {
    return convertChessLibraryColor(
      this.#chessGame.turn()
    );
  }


  // Return all legal moves or moves from one square
  getLegalMoves(startingSquare = null) {
    if (
      startingSquare !== null
      && !isValidChessSquare(startingSquare)
    ) {
      throw new Error("Invalid startingSquare");
    }

    const moveOptions = {
      verbose: true,
    };

    if (startingSquare !== null)
      moveOptions.square = startingSquare;

    const legalMoves =
      this.#chessGame.moves(moveOptions);

    return legalMoves.map((legalMove) => ({
      startingSquare:
        legalMove.from,

      targetSquare:
        legalMove.to,

      chessPieceType:
        CHESS_PIECE_TYPES[legalMove.piece],

      capturedChessPieceType:
        legalMove.captured
          ? CHESS_PIECE_TYPES[legalMove.captured]
          : null,

      promotionChessPieceType:
        legalMove.promotion
          ? CHESS_PIECE_TYPES[legalMove.promotion]
          : null,

      standardAlgebraicNotation:
        legalMove.san,
    }));
  }


  // Validate and apply a move
  makeMove({
    startingSquare,
    targetSquare,
    promotionChessPieceType = null,
  }) {
    if (this.isGameFinished()) {
      return {
        moveWasSuccessful: false,
        errorMessage:
          "The chess game is already finished",
      };
    }

    if (!isValidChessSquare(startingSquare)) {
      return {
        moveWasSuccessful: false,
        errorMessage:
          "Invalid starting square",
      };
    }

    if (!isValidChessSquare(targetSquare)) {
      return {
        moveWasSuccessful: false,
        errorMessage:
          "Invalid target square",
      };
    }

    if (
      promotionChessPieceType !== null
      && !PROMOTION_PIECES.has(
        promotionChessPieceType
      )
    ) {
      return {
        moveWasSuccessful: false,
        errorMessage:
          "Invalid promotion piece type",
      };
    }

    const requestedChessMove = {
      from: startingSquare,
      to: targetSquare,
    };

    if (promotionChessPieceType !== null) {
      requestedChessMove.promotion =
        CHESS_LIBRARY_PIECE_TYPES[
          promotionChessPieceType
        ];
    }

    try {
      const appliedChessMove =
        this.#chessGame.move(
          requestedChessMove
        );

      this.#updateChessGameResult();

      return {
        moveWasSuccessful: true,

        appliedChessMove: {
          startingSquare:
            appliedChessMove.from,

          targetSquare:
            appliedChessMove.to,

          chessPieceType:
            CHESS_PIECE_TYPES[
              appliedChessMove.piece
            ],

          capturedChessPieceType:
            appliedChessMove.captured
              ? CHESS_PIECE_TYPES[
                  appliedChessMove.captured
                ]
              : null,

          promotionChessPieceType:
            appliedChessMove.promotion
              ? CHESS_PIECE_TYPES[
                  appliedChessMove.promotion
                ]
              : null,

          standardAlgebraicNotation:
            appliedChessMove.san,
        },

        chessGameState:
          this.getGameState(),
      };
    } catch {
      return {
        moveWasSuccessful: false,
        errorMessage:
          "Illegal chess move",
      };
    }
  }


  // End the game by resignation
  resign(resigningPlayerColor) {
    if (
      resigningPlayerColor !== CHESS_COLORS.WHITE
      && resigningPlayerColor !== CHESS_COLORS.BLACK
    ) {
      return {
        resignationWasSuccessful: false,
        errorMessage:
          "Invalid player color",
      };
    }

    if (this.isGameFinished()) {
      return {
        resignationWasSuccessful: false,
        errorMessage:
          "The chess game is already finished",
      };
    }

    this.#chessGameFinished = true;

    this.#chessGameEndReason =
      CHESS_GAME_END_REASON.RESIGNATION;

    this.#chessGameResult =
      resigningPlayerColor === CHESS_COLORS.WHITE
        ? CHESS_GAME_RESULT.BLACK_PLAYER_WON
        : CHESS_GAME_RESULT.WHITE_PLAYER_WON;

    return {
      resignationWasSuccessful: true,
      chessGameState:
        this.getGameState(),
    };
  }


  // End the game after both players agree to a draw.
  agreeDraw() {
    if (this.isGameFinished()) {
      return { drawWasSuccessful: false };
    }

    this.#chessGameFinished = true;
    this.#chessGameResult = CHESS_GAME_RESULT.DRAW;
    this.#chessGameEndReason = CHESS_GAME_END_REASON.AGREEMENT;

    return { drawWasSuccessful: true };
  }


  // Check if the game is finished
  isGameFinished() {
    return this.#chessGameFinished;
  }


  // Return the current FEN position
  getCurrentPositionFen() {
    return this.#chessGame.fen();
  }


  // Return the move history
  getMoveHistory() {
    return this.#chessGame
      .history({ verbose: true })
      .map((chessMove, moveIndex) => ({
        chessPlyNumber:
          moveIndex + 1,

        chessPlayerColor:
          convertChessLibraryColor(
            chessMove.color
          ),

        startingSquare:
          chessMove.from,

        targetSquare:
          chessMove.to,

        chessPieceType:
          CHESS_PIECE_TYPES[
            chessMove.piece
          ],

        capturedChessPieceType:
          chessMove.captured
            ? CHESS_PIECE_TYPES[
                chessMove.captured
              ]
            : null,

        promotionChessPieceType:
          chessMove.promotion
            ? CHESS_PIECE_TYPES[
                chessMove.promotion
              ]
            : null,

        standardAlgebraicNotation:
          chessMove.san,
      }));
  }


  // Update result and end reason
  #updateChessGameResult() {
    if (!this.#chessGame.isGameOver())
      return;

    this.#chessGameFinished = true;

    if (this.#chessGame.isCheckmate()) {
      const losingPlayerColor =
        convertChessLibraryColor(
          this.#chessGame.turn()
        );

      this.#chessGameResult =
        losingPlayerColor === CHESS_COLORS.WHITE
          ? CHESS_GAME_RESULT.BLACK_PLAYER_WON
          : CHESS_GAME_RESULT.WHITE_PLAYER_WON;

      this.#chessGameEndReason =
        CHESS_GAME_END_REASON.CHECKMATE;

      return;
    }

    this.#chessGameResult =
      CHESS_GAME_RESULT.DRAW;

    if (this.#chessGame.isStalemate()) {
      this.#chessGameEndReason =
        CHESS_GAME_END_REASON.STALEMATE;

      return;
    }

    if (
      this.#chessGame.isThreefoldRepetition()
    ) {
      this.#chessGameEndReason =
        CHESS_GAME_END_REASON
          .THREEFOLD_REPETITION;

      return;
    }

    if (
      this.#chessGame.isInsufficientMaterial()
    ) {
      this.#chessGameEndReason =
        CHESS_GAME_END_REASON
          .INSUFFICIENT_MATERIAL;

      return;
    }

    if (
      this.#chessGame.isDrawByFiftyMoves()
    ) {
      this.#chessGameEndReason =
        CHESS_GAME_END_REASON
          .FIFTY_MOVE_RULE;

      return;
    }

    this.#chessGameEndReason =
      CHESS_GAME_END_REASON.DRAW;
  }
}


export {
  CHESS_COLORS,
  CHESS_GAME_RESULT,
  CHESS_GAME_END_REASON,
};

export default ChessEngine;
