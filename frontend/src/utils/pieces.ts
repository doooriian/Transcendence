import { getRandomInt } from "./random";
import type {
  ChessAppearance,
  ChessPiece,
  ChessPieceType,
  PieceImages,
} from "./types";

import bbp from "../assets/pieces_pink/bb.svg";
import bwp from "../assets/pieces_pink/bw.svg";
import kbp from "../assets/pieces_pink/kb.svg";
import kwp from "../assets/pieces_pink/kw.svg";
import nbp from "../assets/pieces_pink/nb.svg";
import nwp from "../assets/pieces_pink/nw.svg";
import pbp from "../assets/pieces_pink/pb.svg";
import pwp from "../assets/pieces_pink/pw.svg";
import qbp from "../assets/pieces_pink/qb.svg";
import qwp from "../assets/pieces_pink/qw.svg";
import rbp from "../assets/pieces_pink/rb.svg";
import rwp from "../assets/pieces_pink/rw.svg";

import bbl from "../assets/pieces_blue/bb.svg";
import bwl from "../assets/pieces_blue/bw.svg";
import kbl from "../assets/pieces_blue/kb.svg";
import kwl from "../assets/pieces_blue/kw.svg";
import nbl from "../assets/pieces_blue/nb.svg";
import nwl from "../assets/pieces_blue/nw.svg";
import pbl from "../assets/pieces_blue/pb.svg";
import pwl from "../assets/pieces_blue/pw.svg";
import qbl from "../assets/pieces_blue/qb.svg";
import qwl from "../assets/pieces_blue/qw.svg";
import rbl from "../assets/pieces_blue/rb.svg";
import rwl from "../assets/pieces_blue/rw.svg";

import bbb from "../assets/pieces_brown/bb.svg";
import bwb from "../assets/pieces_brown/bw.svg";
import kbb from "../assets/pieces_brown/kb.svg";
import kwb from "../assets/pieces_brown/kw.svg";
import nbb from "../assets/pieces_brown/nb.svg";
import nwb from "../assets/pieces_brown/nw.svg";
import pbb from "../assets/pieces_brown/pb.svg";
import pwb from "../assets/pieces_brown/pw.svg";
import qbb from "../assets/pieces_brown/qb.svg";
import qwb from "../assets/pieces_brown/qw.svg";
import rbb from "../assets/pieces_brown/rb.svg";
import rwb from "../assets/pieces_brown/rw.svg";

const pieceSets: PieceImages[] = [
  {
    white: { pawn: pwp, rook: rwp, knight: nwp, bishop: bwp, queen: qwp, king: kwp },
    black: { pawn: pbp, rook: rbp, knight: nbp, bishop: bbp, queen: qbp, king: kbp },
  },
  {
    white: { pawn: pwl, rook: rwl, knight: nwl, bishop: bwl, queen: qwl, king: kwl },
    black: { pawn: pbl, rook: rbl, knight: nbl, bishop: bbl, queen: qbl, king: kbl },
  },
  {
    white: { pawn: pwb, rook: rwb, knight: nwb, bishop: bwb, queen: qwb, king: kwb },
    black: { pawn: pbb, rook: rbb, knight: nbb, bishop: bbb, queen: qbb, king: kbb },
  },
];

export function createChessAppearance(): ChessAppearance {
  const boardTheme = getRandomInt(1, 3);
  const pieceTheme = getRandomInt(1, 3);

  let boardStyles: Pick<ChessAppearance, "borderThemeClass" | "whiteCaseClass" | "darkCaseClass">;

  switch (boardTheme) {
    case 1:
      boardStyles = {
        borderThemeClass: "rounded-2xl overflow-hidden border-8 border-olive-950",
        whiteCaseClass: "bg-gradient-to-br from-stone-600 via-stone-300 to-white",
        darkCaseClass: "bg-gradient-to-br from-black via-stone-800 to-black",
      };
      break;
    case 2:
      boardStyles = {
        borderThemeClass: "rounded-2xl overflow-hidden border-8 border-indigo-950",
        whiteCaseClass: "bg-gradient-to-br from-cyan-300 via-sky-350 to-white",
        darkCaseClass: "bg-gradient-to-br from-cyan-900 via-sky-950 to-black",
      };
      break;
    default:
      boardStyles = {
        borderThemeClass: "rounded-2xl overflow-hidden border-8 border-amber-950",
        whiteCaseClass: "bg-gradient-to-br from-pink-200 via-rose-300 to-white",
        darkCaseClass: "bg-gradient-to-br from-rose-400 via-pink-350 to-black",
      };
  }

  return {
    ...boardStyles,
    pieceImages: pieceSets[pieceTheme - 1] ?? pieceSets[0],
  };
}

export function getPieceImage(
  piece: ChessPiece,
  pieceImages: PieceImages,
): string | undefined {
  if (!piece) return undefined;

  const type = piece.chessPieceType as ChessPieceType;
  return pieceImages[piece.chessPieceColor][type];
}
