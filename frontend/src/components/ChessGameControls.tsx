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
    <div className="mx-auto mt-6 flex w-[min(660px,100%,calc(100vh-475px))] items-center justify-between gap-4">
      <div className={`flex items-center gap-3 rounded-2xl border border-white/20 container-theme-${theme} px-5 py-3 shadow-lg backdrop-blur-lg`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 text-xl font-bold">
          T
        </div>
        <div>
          <p className="text-lg font-bold">You</p>
          <p className="text-sm text-white/70">1200 Elo</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start justify-self-start gap-3">
        <div className="flex gap-4">
          <button
            className={`rounded-xl border border-white/20 container-theme-${theme} px-8 py-3 font-semibold shadow-lg backdrop-blur-lg transition-all hover:scale-105 hover:opacity-90`}
            onClick={onResign}
          >
            Give up
          </button>

          <button
            type="button"
            onClick={onOfferDraw}
            disabled={!myColor || !game.black || game.chess.isGameFinished || Boolean(game.bot)}
            title={game.bot ? "Draw offers are only available in two-player games." : "Offer your opponent a draw"}
            className={`rounded-xl bg-gradient-to-r px-8 py-3 font-semibold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-40 ${drawButtonColors}`}
          >
            Offer draw ({drawOffersMade}/3)
          </button>
        </div>

        {!game.chess.isGameFinished && game.draw.offer?.offeredBy === myAuthId && (
          <p className="max-w-xs text-sm text-amber-300" role="status">
            Draw offer sent. Waiting for your opponent’s response…
          </p>
        )}
      </div>

      <div className={`rounded-2xl border border-white/20 container-theme-${theme} px-6 py-3 font-mono text-xl shadow-lg backdrop-blur-lg`}>
        00:00
      </div>
    </div>
  );
}
