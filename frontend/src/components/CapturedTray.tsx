import { getPieceImage } from "../utils/pieces";
import type { ChessPieceData, PieceImages } from "../utils/types";

type CapturedTrayProps = {
  pieces: ChessPieceData[];
  label: string;
  pieceImages: PieceImages;
};

export default function CapturedTray({ pieces, label, pieceImages }: CapturedTrayProps) {
  if (pieces.length === 0) {
    return (
      <div className="hidden w-56 shrink-0 lg:block" aria-hidden="true">
        <p className="py-2 text-center text-xs text-white/50">{label}</p>
      </div>
    );
  }

  return (
    <div
      className="hidden w-56 shrink-0 flex-col items-center rounded-2xl p-3 lg:flex"
      style={{ maxHeight: "calc(100vh - 475px)" }}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/60">
        {label}
      </p>
      <div className="grid w-full grid-cols-3 place-items-center gap-1 overflow-auto">
        {pieces.map((piece, index) => (
          <img
            key={`${piece.chessPieceType}-${index}`}
            src={getPieceImage(piece, pieceImages)}
            alt={piece.chessPieceType}
            className="h-15 w-15 object-contain opacity-90 drop-shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
