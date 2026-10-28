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
    <div className="mx-auto mt-4 flex w-full max-w-[660px] min-w-0 flex-col items-stretch gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className={`flex min-w-0 items-center gap-3 rounded-2xl border border-white/20 container-theme-${theme} px-3 py-2 shadow-lg backdrop-blur-lg sm:px-5 sm:py-3`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 text-xl font-bold sm:h-12 sm:w-12">
          T
        </div>
        <div>
          <p className="text-base font-bold sm:text-lg">You</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-stretch gap-2 sm:items-start sm:gap-3">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <button
            type="button"
            disabled={game.chess.isGameFinished}
            onClick={onResign}
            className={`min-w-0 rounded-xl border border-white/20 container-theme-${theme} px-2 py-3 text-sm font-semibold shadow-lg backdrop-blur-lg transition-all sm:px-5 sm:text-base ${
                game.chess.isGameFinished
                    ? "cursor-not-allowed opacity-40"
                    : "hover:opacity-90 sm:hover:scale-105"
            }`}
          >
            Give up
          </button>

          <button
            type="button"
            onClick={onOfferDraw}
            disabled={!myColor || !game.black || game.chess.isGameFinished || Boolean(game.bot) || game.chess.currentPlayerColor !== myColor || game.draw.offer !== null || drawOffersMade >= game.draw.maxOffers}
            title={game.bot ? "Draw offers are only available in two-player games." : "Offer your opponent a draw"}
            className={`min-w-0 rounded-xl bg-gradient-to-r px-2 py-3 text-sm font-semibold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-base ${drawButtonColors}`}
          >
            Offer draw ({drawOffersMade}/{game.draw.maxOffers})
          </button>
        </div>

        {!game.chess.isGameFinished && game.draw.offer?.offeredBy === myAuthId && (
          <p className="max-w-xs text-sm text-amber-300" role="status">
            Draw offer sent. Waiting for your opponent’s response…
          </p>
        )}
      </div>
    </div>
  );
}
