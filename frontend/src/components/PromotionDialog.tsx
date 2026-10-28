import type { PromotionPiece, PieceImages } from "../utils/types";

export type PromotionSquare = {
  startingSquare: string;
  targetSquare: string;
  pieceColor: "white" | "black";
};

type PromotionDialogProps = {
  promotionSquare: PromotionSquare | null;
  theme: string;
  pieceImages: PieceImages;
  onPromote: (pieceType: PromotionPiece) => void;
};

const promotionChoices: { type: PromotionPiece; label: string }[] = [
  { type: "queen", label: "Dame" },
  { type: "rook", label: "Tour" },
  { type: "bishop", label: "Fou" },
  { type: "knight", label: "Cavalier" },
];

export default function PromotionDialog({
  promotionSquare,
  theme,
  pieceImages,
  onPromote,
}: PromotionDialogProps) {
  if (!promotionSquare) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/30 bg-gradient-to-br from-purple-900/95 to-indigo-950/95 p-4 shadow-2xl sm:p-8">
        <h2 className="mb-5 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-center text-xl font-bold text-transparent sm:mb-6 sm:text-2xl">
          Promotion
        </h2>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {promotionChoices.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onPromote(type)}
              className={`flex h-20 min-w-0 items-center justify-center rounded-xl border border-white/20 container-theme-${theme} shadow-lg transition hover:opacity-90 sm:h-28 sm:w-24 sm:rounded-2xl sm:hover:scale-110`}
            >
              <img
                src={pieceImages[promotionSquare.pieceColor][type]}
                alt={label}
                className="h-14 w-14 object-contain drop-shadow-lg sm:h-20 sm:w-20"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
