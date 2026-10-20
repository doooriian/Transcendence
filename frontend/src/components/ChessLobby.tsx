import type { ChangeEvent, KeyboardEvent } from "react";
import type { ChessGame } from "../utils/types";

type BotDifficulty = "easy" | "medium" | "hard";

type ChessLobbyProps = {
  game: ChessGame | null;
  error: string | null;
  theme: string;
  botDifficulty: BotDifficulty;
  onBotDifficultyChange: (difficulty: BotDifficulty) => void;
  joinGameId: string;
  onJoinGameIdChange: (value: string) => void;
  botError: boolean;
  onCreateGame: () => void;
  onCreateBotGame: () => void;
  onJoinGame: () => void;
  onCancelGame: () => void;
  onRetryBot: () => void;
  onEndGame: () => void;
  getGameResult: (result: string | null) => string;
  getEndReasonText: (reason: string | null) => string;
};

export default function ChessLobby({
  game,
  error,
  theme,
  botDifficulty,
  onBotDifficultyChange,
  joinGameId,
  onJoinGameIdChange,
  botError,
  onCreateGame,
  onCreateBotGame,
  onJoinGame,
  onCancelGame,
  onRetryBot,
  onEndGame,
  getGameResult,
  getEndReasonText,
}: ChessLobbyProps) {
  return (
	<>
	  {!game && (
		<div className="mx-auto mt-8 grid w-full max-w-4xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:gap-8">
			<div className="flex w-full flex-col justify-center gap-4">
			<button
				onClick={onCreateGame}
				className="min-h-14 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 font-semibold shadow-lg transition-all hover:scale-105 hover:from-violet-400 hover:to-fuchsia-400"
			>
				Create a game
			</button>

			<input
				type="text"
				placeholder="Join a game with the ID"
				value={joinGameId}
				onChange={(event: ChangeEvent<HTMLInputElement>) =>
				onJoinGameIdChange(event.target.value)
				}
				onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
				if (event.key === "Enter") onJoinGame();
				}}
				className={`min-h-14 w-full rounded-xl border border-white/20 container-theme-${theme} px-4 py-3 outline-none backdrop-blur-lg focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20`}
			/>
			</div>

			<div className="flex w-full flex-col justify-center gap-4">
			<div className="relative w-full">
				<select
				aria-label="Bot difficulty"
				value={botDifficulty}
				onChange={(event: ChangeEvent<HTMLSelectElement>) =>
					onBotDifficultyChange(event.target.value as BotDifficulty)
				}
				className={`min-h-14 w-full cursor-pointer appearance-none rounded-xl border border-white/20 container-theme-${theme} py-3 pl-4 pr-11 text-sm font-semibold text-white shadow-lg outline-none backdrop-blur-lg transition duration-200 hover:border-white/40 focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/30`}
				style={{ colorScheme: "dark" }}
				>
				<option className="bg-slate-900 text-white" value="easy">
					Easy
				</option>
				<option className="bg-slate-900 text-white" value="medium">
					Medium
				</option>
				<option className="bg-slate-900 text-white" value="hard">
					Hard
				</option>
				</select>

				<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
				>
				<path
					d="m6 9 6 6 6-6"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				</svg>
			</div>

			<button
				onClick={onCreateBotGame}
				className="min-h-14 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold shadow-lg transition hover:bg-violet-500"
			>
				Play against bot
			</button>
			</div>

		</div>
		)}

	  {error && <p className="mt-4 text-red-400" role="alert">{error}</p>}

	  {game?.bot && !game.chess.isGameFinished && game.chess.currentPlayerColor === "black" && (
		<div className="mt-3 text-center" aria-live="polite">
		  {botError ? (
			<button className="rounded-xl bg-violet-600 px-4 py-2" onClick={onRetryBot}>
			  Retry bot turn
			</button>
		  ) : (
			"Stockfish is thinking…"
		  )}
		</div>
	  )}

	  {game && !game.chess.isGameFinished && game.black === null && (
		<div className={`mt-6 rounded-2xl border border-white/20 container-theme-${theme} px-6 py-4 shadow-lg backdrop-blur-lg`}>
		  <div className="mt-4 flex flex-col items-center">
			<p className="mt-2 text-amber-300">Waiting for an opponent...</p>
			<button
			  onClick={onCancelGame}
			  className="mt-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-6 py-2 font-semibold shadow-lg transition-all hover:from-rose-400 hover:to-red-500"
			>
			  Cancel
			</button>
		  </div>
		</div>
	  )}

	  {game?.chess.isGameFinished && (
		<div className={`flex flex-col items-center justify-center rounded-2xl border border-white/30 container-theme-${theme} px-6 py-8 text-center shadow-2xl backdrop-blur-xl`}>
		  <p
			className={`mb-2 text-2xl font-bold ${
			  game.chess.chessGameResult === "draw"
				? "text-amber-300"
				: getGameResult(game.chess.chessGameResult) === "Victoire"
				  ? "text-emerald-300"
				  : "text-rose-300"
			}`}
		  >
			{getGameResult(game.chess.chessGameResult)}
		  </p>
		  <p className="text-sm text-white/70">
			{getEndReasonText(game.chess.chessGameEndReason)}
		  </p>
		  <button
			onClick={onEndGame}
			className="mt-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-semibold transition-all hover:scale-105 hover:from-violet-400 hover:to-fuchsia-400"
		  >
			New game
		  </button>
		</div>
	  )}
	</>
  );
}
