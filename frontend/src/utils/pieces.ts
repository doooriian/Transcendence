import type {
  ChessAppearance,
  ChessPiece,
  ChessPieceType,
  PieceImages,
} from "./types";

import bb from "../assets/pieces/bb.svg";
import bw from "../assets/pieces/bw.svg";
import kb from "../assets/pieces/kb.svg";
import kw from "../assets/pieces/kw.svg";
import nb from "../assets/pieces/nb.svg";
import nw from "../assets/pieces/nw.svg";
import pb from "../assets/pieces/pb.svg";
import pw from "../assets/pieces/pw.svg";
import qb from "../assets/pieces/qb.svg";
import qw from "../assets/pieces/qw.svg";
import rb from "../assets/pieces/rb.svg";
import rw from "../assets/pieces/rw.svg";

const pieceImages: PieceImages = {
  white: {
    pawn: pw,
    rook: rw,
    knight: nw,
    bishop: bw,
    queen: qw,
    king: kw,
  },
  black: {
    pawn: pb,
    rook: rb,
    knight: nb,
    bishop: bb,
    queen: qb,
    king: kb,
  },
};

export function createChessAppearance(): ChessAppearance {
  return {
    borderThemeClass: "rounded-2xl overflow-hidden border-8 border-olive-950",
    whiteCaseClass:
      "bg-gradient-to-br from-stone-600 via-stone-300 to-white",
    darkCaseClass:
      "bg-gradient-to-br from-black via-stone-800 to-black",
    pieceImages,
  };
}

export function getPieceImage(
  piece: ChessPiece,
  images: PieceImages,
): string | undefined {
  if (!piece) {
    return undefined;
  }

  const type = piece.chessPieceType as ChessPieceType;

  return images[piece.chessPieceColor][type];
}
