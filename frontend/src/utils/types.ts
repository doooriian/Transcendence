export type ChessColor = "white" | "black";

export type ChessPieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";

export type ChessPiece = {
  chessPieceType: string;
  chessPieceColor: ChessColor;
} | null;

export type ChessPieceData = NonNullable<ChessPiece>;

export type ChessMove = {
  startingSquare: string;
  targetSquare: string;
  chessPieceType: string;
  capturedChessPieceType: string | null;
  promotionChessPieceType: string | null;
  standardAlgebraicNotation: string;
};

export type ChessGame = {
  id: string;
  white: string;
  black: string | null;
  bot: { difficulty: "easy" | "medium" | "hard" } | null;
  draw: {
    offer: {
      id: string;
      offeredBy: string;
      responseAvailableAt: number;
    } | null;
    offersMade: { white: number; black: number };
    maxOffers: number;
    responseDelayMs: number;
  };
  chess: {
    chessBoard: ChessPiece[][];
    currentPlayerColor: ChessColor;
    isGameFinished: boolean;
    chessGameResult: string | null;
    chessGameEndReason: string | null;
    isCurrentPlayerInCheck: boolean;
    currentPositionFen: string;
    moveHistory: ChessMove[];
  };
};

export type BoardPosition = {
  row: number;
  col: number;
};

export type DraggedPiece = BoardPosition & {
  piece: ChessPiece;
};

export type PromotionPiece = "queen" | "rook" | "bishop" | "knight";

export type PieceImages = Record<ChessColor, Record<ChessPieceType, string>>;

export type ChessAppearance = {
  borderThemeClass: string;
  whiteCaseClass: string;
  darkCaseClass: string;
  pieceImages: PieceImages;
};
