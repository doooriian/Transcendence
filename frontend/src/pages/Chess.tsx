
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import Footer from "../components/Footer";
import Header from "../components/Header";
import DrawOfferDialog from "../components/DrawOfferDialog";
import CapturedTray from "../components/CapturedTray";
import ChessBoard from "../components/ChessBoard";
import ChessGameControls from "../components/ChessGameControls";
import ChessLobby from "../components/ChessLobby";
import PromotionDialog from "../components/PromotionDialog";
import { useChessGame } from "../utils/useChessGame";
import { getCapturedPieces } from "../utils/capturedPieces";
import { createChessAppearance } from "../utils/pieces";

function Chess() {
  const { theme } = useTheme();
  const [appearance] = useState(createChessAppearance);
  const chess = useChessGame();

  const {
	game,
	error,
	joinGameId,
	setJoinGameId,
	botDifficulty,
	setBotDifficulty,
	botError,
	drawResponsePending,
	myAuthId,
	myColor,
	draggedPiece,
	selectedSquare,
	promotionSquare,
	legalMoves,
	mousePosition,
	displayedBoard,
	displayedCaseBoard,
	mySideColor,
	hisSideColor,
	searchingGame,
	receivedDrawOffer,
	drawOffersMade,
	drawButtonColors,
	createGame,
	createBotGame,
	joinGame,
	cancelGame,
	resignGame,
	offerDraw,
	respondToDraw,
	endGame,
	retryBot,
	getEndReasonText,
	getGameResult,
	handleSquareClick,
	handlePointerDown,
	handlePointerMove,
	handlePointerUp,
	promote,
  } = chess;

  const capturedByMe =
	game && mySideColor
	  ? getCapturedPieces(game.chess.chessBoard, mySideColor)
	  : [];

  const capturedByOpponent =
	game && hisSideColor
	  ? getCapturedPieces(game.chess.chessBoard, hisSideColor)
	  : [];

  return (
	<div className="flex min-h-screen flex-col overflow-x-clip">
	  {game && receivedDrawOffer && (
		<DrawOfferDialog
		  key={receivedDrawOffer.id}
		  delayMs={game.draw.responseDelayMs}
		  pending={drawResponsePending}
		  error={error}
		  onRespond={respondToDraw}
		/>
	  )}

	  <Header />

	  <main className="flex-1">
		<section className="mx-auto flex w-full max-w-screen-2xl flex-col items-center px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
		  <div className="w-full max-w-6xl">
			{!game && (
			  <div className="mx-auto mb-8 w-full max-w-4xl">
				<ChessLobby
				  game={game}
				  error={error}
				  theme={theme}
				  botDifficulty={botDifficulty}
				  onBotDifficultyChange={setBotDifficulty}
				  joinGameId={joinGameId}
				  onJoinGameIdChange={setJoinGameId}
				  botError={botError}
				  onCreateGame={createGame}
				  onCreateBotGame={createBotGame}
				  onJoinGame={joinGame}
				  onCancelGame={cancelGame}
				  onRetryBot={retryBot}
				  onEndGame={endGame}
				  getGameResult={getGameResult}
				  getEndReasonText={getEndReasonText}
				/>
			  </div>
			)}

			{game && (
			  <div className="mx-auto mb-4 flex w-full max-w-[660px] items-center justify-between gap-3 sm:mb-6 sm:gap-4">
				<div
				  className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/20 container-theme-${theme} px-3 py-3 shadow-lg backdrop-blur-lg sm:gap-3 sm:rounded-2xl sm:px-5`}
				>
				  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-lg font-bold sm:h-12 sm:w-12 sm:text-xl">
					O
				  </div>

				  <div className="min-w-0">
					<p className="truncate text-sm font-bold sm:text-lg">
					  {game.bot
						? `Stockfish · ${game.bot.difficulty}`
						: "Opponent"}
					</p>
					<p className="truncate text-xs text-white/70 sm:text-sm">
					  {game.bot ? "Computer opponent" : "1200 Elo"}
					</p>
				  </div>
				</div>

				<div
				  className={`shrink-0 rounded-xl border border-white/20 container-theme-${theme} px-3 py-3 font-mono text-base shadow-lg backdrop-blur-lg sm:rounded-2xl sm:px-6 sm:text-xl`}
				>
				  00:00
				</div>
			  </div>
			)}

			<div className="mx-auto grid w-full min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,660px)_minmax(0,1fr)] lg:gap-5">
			  <aside className="order-2 mx-auto w-full min-w-0 max-w-[660px] lg:order-1">
				{searchingGame ? (
				  <div
					className={`w-full min-w-0 rounded-2xl border border-white/20 container-theme-${theme} p-4 shadow-lg`}
				  >
					<p className="text-sm text-white/70">Game ID:</p>
					<p className="mb-2 break-all font-mono text-sm">
					  {searchingGame.id}
					</p>

					<div className="space-y-1 break-words">
					  <p className="text-sm">
						<span className="text-white/70">White:</span>{" "}
						{searchingGame.white}
					  </p>
					  <p className="text-sm">
						<span className="text-white/70">Black:</span>{" "}
						{searchingGame.black ?? "Waiting..."}
					  </p>
					</div>
				  </div>
				) : game ? (
				  <CapturedTray
					pieces={capturedByMe}
					label="Captured by you"
					pieceImages={appearance.pieceImages}
				  />
				) : null}
			  </aside>

			  <div className="order-1 mx-auto w-full min-w-0 max-w-[660px] lg:order-2">
				{game ? (
				  <ChessBoard
					game={game}
					board={displayedBoard}
					caseBoard={displayedCaseBoard}
					borderThemeClass={appearance.borderThemeClass}
					whiteCaseClass={appearance.whiteCaseClass}
					darkCaseClass={appearance.darkCaseClass}
					pieceImages={appearance.pieceImages}
					legalMoves={legalMoves}
					draggedPiece={draggedPiece}
					selectedSquare={selectedSquare}
					mousePosition={mousePosition}
					onSquareClick={handleSquareClick}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
				  />
				) : (
				  <div
					className={`mx-auto flex aspect-square w-full items-center justify-center rounded-2xl border border-white/20 container-theme-${theme} shadow-2xl backdrop-blur-lg`}
				  >
					<div className="px-4 text-center">
					  <div className="mb-3 text-5xl sm:mb-4 sm:text-6xl">
						♛
					  </div>
					  <p className="text-base text-white/80 sm:text-lg">
						Create or join a game
					  </p>
					</div>
				  </div>
				)}

				<PromotionDialog
				  promotionSquare={promotionSquare}
				  theme={theme}
				  pieceImages={appearance.pieceImages}
				  onPromote={promote}
				/>
			  </div>

			  <aside className="order-3 mx-auto w-full min-w-0 max-w-[660px] lg:order-3">
				{searchingGame ? (
				  <div className="hidden w-full lg:block" aria-hidden="true" />
				) : game ? (
				  <CapturedTray
					pieces={capturedByOpponent}
					label="Captured by opponent"
					pieceImages={appearance.pieceImages}
				  />
				) : null}
			  </aside>
			</div>

			{game && (
			  <div className="mx-auto mt-4 w-full max-w-[660px] sm:mt-6">
				<ChessGameControls
				  game={game}
				  theme={theme}
				  myAuthId={myAuthId}
				  myColor={myColor}
				  drawOffersMade={drawOffersMade}
				  drawButtonColors={drawButtonColors}
				  onResign={resignGame}
				  onOfferDraw={offerDraw}
				/>
			  </div>
			)}
		  </div>
		</section>
	  </main>

	  <Footer />
	</div>
  );
}

export default Chess;
