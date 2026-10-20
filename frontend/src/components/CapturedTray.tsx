import { getPieceImage } from "../utils/pieces";
import type { ChessPieceData, PieceImages } from "../utils/types";

type CapturedTrayProps = {
  pieces: ChessPieceData[];
  label: string;
  pieceImages: PieceImages;
};

export default function CapturedTray({ pieces, label, pieceImages }: CapturedTrayProps) {
  return (
    <div className="flex w-full min-w-0 flex-row items-center gap-2 rounded-xl p-2 sm:gap-3 sm:p-3 lg:max-h-[calc(100vh-475px)] lg:w-56 lg:shrink-0 lg:flex-col lg:items-center">
      <p className="w-24 shrink-0 text-xs font-medium uppercase tracking-wider text-white/60 sm:w-32 lg:w-full lg:text-center">
        {label}
      </p>
      {pieces.length === 0 ? (
        <span className="text-sm text-white/40" aria-label="No captured pieces">—</span>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:grid lg:w-full lg:flex-none lg:grid-cols-3 lg:place-items-center lg:gap-1 lg:overflow-y-auto">
          {pieces.map((piece, index) => (
            <img
              key={`${piece.chessPieceType}-${index}`}
              src={getPieceImage(piece, pieceImages)}
              alt={piece.chessPieceType}
              loading="lazy"
              className="h-8 w-8 shrink-0 object-contain opacity-90 drop-shadow-sm sm:h-10 sm:w-10 lg:h-15 lg:w-15"
            />
          ))}
        </div>
      )}
    </div>
  );
}
