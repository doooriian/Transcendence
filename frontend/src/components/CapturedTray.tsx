import { getPieceImage } from "../utils/pieces";
import type {
  ChessPieceData,
  ChessPieceType,
  PieceImages,
} from "../utils/types";

import shapeB from "../assets/pieces_shape/b.svg";
import shapeK from "../assets/pieces_shape/k.svg";
import shapeN from "../assets/pieces_shape/n.svg";
import shapeP from "../assets/pieces_shape/p.svg";
import shapeQ from "../assets/pieces_shape/q.svg";
import shapeR from "../assets/pieces_shape/r.svg";

type CapturedTrayProps = {
  pieces: ChessPieceData[];
  label: string;
  pieceImages: PieceImages;
  backgroundClassName?: string;
};

const SLOT_LAYOUT: ChessPieceType[] = [
  "queen",
  "rook",
  "rook",
  "bishop",
  "bishop",
  "knight",
  "knight",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
  "pawn",
];

function getPieceSilhouette(type: ChessPieceType) {
  switch (type) {
    case "pawn":
      return shapeP;
    case "rook":
      return shapeR;
    case "knight":
      return shapeN;
    case "bishop":
      return shapeB;
    case "queen":
      return shapeQ;
    case "king":
      return shapeK;
  }
}

function getCapturedSlots(pieces: ChessPieceData[]) {
  const availablePieces = new Map<ChessPieceType, ChessPieceData[]>();

  for (const piece of pieces) {
    const type = piece.chessPieceType as ChessPieceType;
    const piecesOfType = availablePieces.get(type) ?? [];

    piecesOfType.push(piece);
    availablePieces.set(type, piecesOfType);
  }

  return SLOT_LAYOUT.map((type) => ({
    type,
    piece: availablePieces.get(type)?.shift() ?? null,
  }));
}

export default function CapturedTray({
  pieces,
  label,
  pieceImages,
  backgroundClassName = "bg-gradient-to-r from-red-700 to-orange-500",
}: CapturedTrayProps) {
  const slots = getCapturedSlots(pieces);

  return (
    <div
      className={`flex w-full min-w-0 flex-col items-center rounded-2xl border-8 border-olive-950 p-3 shadow-2xl ring-4 ring-purple-500/20 ${backgroundClassName}`}
    >
      <p className="mb-2 shrink-0 text-center text-xs font-semibold uppercase tracking-wider text-white/60">
        {label}

        {pieces.length > 0 && (
          <span className="ml-1 text-white/40">({pieces.length})</span>
        )}
      </p>

      <div className="grid w-full grid-cols-5 place-items-center gap-1 lg:grid-cols-3 lg:grid-rows-5">
        {slots.map(({ type, piece }, index) => (
          <img
            key={`${type}-${index}`}
            src={
              piece
                ? getPieceImage(piece, pieceImages)
                : getPieceSilhouette(type)
            }
            alt={piece ? type : ""}
            aria-hidden={piece ? undefined : true}
            className={`h-10 w-10 object-contain sm:h-12 sm:w-12 lg:h-full lg:w-full ${
              piece ? "drop-shadow-md" : "opacity-40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
