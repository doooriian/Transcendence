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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-3xl border border-white/30 bg-gradient-to-br from-purple-900/95 to-indigo-950/95 p-8 shadow-2xl">
        <h2 className="mb-6 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-center text-2xl font-bold text-transparent">
          Promotion
        </h2>

        <div className="flex gap-4">
          {promotionChoices.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onPromote(type)}
              className={`flex h-28 w-24 items-center justify-center rounded-2xl border border-white/20 container-theme-${theme} shadow-lg transition-all hover:scale-110 hover:opacity-90`}
            >
              <img
                src={pieceImages[promotionSquare.pieceColor][type]}
                alt={label}
                className="h-20 w-20 object-contain drop-shadow-lg"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
