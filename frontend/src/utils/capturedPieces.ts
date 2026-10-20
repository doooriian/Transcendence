import type { ChessPiece, ChessPieceData, ChessPieceType } from "./types";

const INITIAL_PIECE_COUNTS: Record<ChessPieceType, number> = {
  pawn: 8,
  knight: 2,
  bishop: 2,
  rook: 2,
  queen: 1,
  king: 1,
};

const CAPTURED_PIECE_ORDER: ChessPieceType[] = [
  "queen",
  "rook",
  "bishop",
  "knight",
  "pawn",
];

/** Déduit les pièces prises en comparant le plateau au nombre de départ. */
export function getCapturedPieces(
  chessBoard: ChessPiece[][],
  color: "white" | "black",
): ChessPieceData[] {
  const remaining: Record<ChessPieceType, number> = {
    pawn: 0,
    knight: 0,
    bishop: 0,
    rook: 0,
    queen: 0,
    king: 0,
  };

  for (const row of chessBoard) {
    for (const piece of row) {
      if (!piece || piece.chessPieceColor !== color) continue;

      const type = piece.chessPieceType as ChessPieceType;
      if (type in remaining) remaining[type] += 1;
    }
  }

  const captured: ChessPieceData[] = [];

  for (const type of CAPTURED_PIECE_ORDER) {
    const missingCount = INITIAL_PIECE_COUNTS[type] - remaining[type];
    for (let index = 0; index < missingCount; index += 1) {
      captured.push({ chessPieceType: type, chessPieceColor: color });
    }
  }

  return captured;
}
