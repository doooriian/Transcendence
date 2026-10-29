import { useState, type ChangeEvent, type KeyboardEvent } from "react";
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
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showBotInput, setShowBotInput] = useState(false);

  function handleCreateGame() {
    setShowJoinInput(false);
    setShowBotInput(false);
    onCreateGame();
  }

  function handleBotButton() {
    if (showBotInput) {
      onCreateBotGame();
      return;
    }

    setShowBotInput(true);
    setShowJoinInput(false);
  }

  function handleJoinButton() {
    if (showJoinInput) {
      onJoinGame();
      return;
    }

    setShowJoinInput(true);
    setShowBotInput(false);
  }

  return (
    <>
      {!game && (
        <div className="mx-auto mt-8 w-full max-w-[660px]">
          <div className="rounded-2xl border-8 border-olive-950 bg-black p-2 shadow-2xl ring-4 ring-purple-500/20">
            {showJoinInput ? (
              <input
                type="text"
                placeholder="Paste game ID here"
                value={joinGameId}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onJoinGameIdChange(event.target.value)
                }
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    onJoinGame();
                  }
                }}
                className="h-12 w-full rounded-xl border border-white/20 bg-gradient-to-r from-cyan-700 to-sky-300 px-4 font-semibold text-white outline-none placeholder:text-white/70 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
              />
            ) : showBotInput ? (
              <div className="relative">
                <select
                  aria-label="Bot difficulty"
                  value={botDifficulty}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    onBotDifficultyChange(event.target.value as BotDifficulty)
                  }
                  className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-white/20 bg-gradient-to-r from-cyan-700 to-sky-300 px-4 text-center font-semibold text-white outline-none"
                  style={{ colorScheme: "dark" }}
                >
                  <option className="bg-[#194b7b]" value="easy">
                    Easy
                  </option>

                  <option className="bg-[#194b7b]" value="medium">
                    Medium
                  </option>

                  <option className="bg-[#194b7b]" value="hard">
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
            ) : (
              <div className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-700 to-sky-300 font-semibold text-white shadow-lg">
                Create or join a game
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              onClick={handleCreateGame}
              className="h-12 rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 px-3 font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-400"
            >
              Create a game
            </button>

            <button
              onClick={handleBotButton}
              className="h-12 rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 px-3 font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-400"
            >
              {showBotInput ? "Start bot game" : "Play against bot"}
            </button>

            <button
              onClick={handleJoinButton}
              className="h-12 rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 px-3 font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-400"
            >
              {showJoinInput ? "Join game" : "Join a game"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-center text-red-400" role="alert">
          {error}
        </p>
      )}

      {game?.bot &&
        !game.chess.isGameFinished &&
        game.chess.currentPlayerColor === "black" && (
          <div className="mt-3 text-center" aria-live="polite">
            {botError ? (
              <button
                className="rounded-xl bg-violet-600 px-4 py-2"
                onClick={onRetryBot}
              >
                Retry bot turn
              </button>
            ) : (
              "Stockfish is thinking…"
            )}
          </div>
        )}

      {game && !game.chess.isGameFinished && game.black === null && (
        <div
          className={`mt-6 rounded-2xl border border-white/20 container-theme-${theme} px-6 py-4 shadow-lg backdrop-blur-lg`}
        >
          <div className="mt-4 flex flex-col items-center">
            <p className="mb-2 text-sm text-white/70">Game ID</p>

            <div className="w-full select-text break-all rounded-xl bg-gradient-to-r from-cyan-700 to-sky-300 px-4 py-3 text-center font-semibold text-white shadow-lg">
              {game.id}
            </div>

            <p className="mt-3 text-amber-300">Waiting for an opponent...</p>

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
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border border-white/30 container-theme-${theme} px-6 py-8 text-center shadow-2xl backdrop-blur-xl`}
        >
          <p
            className={`mb-2 text-2xl font-bold ${
              game.chess.chessGameResult === "draw"
                ? "text-amber-300"
                : getGameResult(game.chess.chessGameResult) === "Victory"
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
            className="mt-4 rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-400"
          >
            New game
          </button>
        </div>
      )}
    </>
  );
}
