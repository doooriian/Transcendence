import type { ChessGame } from "../utils/types";

type ChessGameControlsProps = {
  game: ChessGame;
  theme: string;
  myAuthId: string | null;
  myColor: "white" | "black" | null;
  drawOffersMade: number;
  drawButtonColors: string;
  onResign: () => void;
  onOfferDraw: () => void;
};

export default function ChessGameControls({
  game,
  theme,
  myAuthId,
  myColor,
  drawOffersMade,
  drawButtonColors,
  onResign,
  onOfferDraw,
}: ChessGameControlsProps) {
  return (
    <div className="mx-auto mt-4 w-full max-w-[460px] sm:mt-6">
      <div className="rounded-2xl border-8 border-olive-950 bg-black p-2 shadow-2xl ring-4 ring-purple-500/20">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={game.chess.isGameFinished}
            onClick={onResign}
            className="min-h-12 rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 px-4 font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Give up
          </button>

          <button
            type="button"
            onClick={onOfferDraw}
            disabled={
              !myColor ||
              !game.black ||
              game.chess.isGameFinished ||
              Boolean(game.bot) ||
              game.chess.currentPlayerColor !== myColor ||
              game.draw.offer !== null ||
              drawOffersMade >= game.draw.maxOffers
            }
            title={
              game.bot
                ? "Draw offers are only available in two-player games."
                : "Offer your opponent a draw"
            }
            className={`min-h-12 rounded-xl bg-gradient-to-r px-4 font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${drawButtonColors}`}
          >
            Offer draw ({drawOffersMade}/{game.draw.maxOffers})
          </button>
        </div>
      </div>

      {!game.chess.isGameFinished &&
        game.draw.offer?.offeredBy === myAuthId && (
          <p
            className={`mt-3 rounded-xl border border-white/20 container-theme-${theme} px-4 py-3 text-center text-sm text-amber-300`}
            role="status"
          >
            Draw offer sent. Waiting for your opponent&apos;s response...
          </p>
        )}
    </div>
  );
}
