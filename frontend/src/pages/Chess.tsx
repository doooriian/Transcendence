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
	handleMouseDown,
	handleMouseMove,
	handleMouseUp,
	promote,
  } = chess;

  const capturedByMe =
	game && mySideColor ? getCapturedPieces(game.chess.chessBoard, mySideColor) : [];
  const capturedByOpponent =
	game && hisSideColor ? getCapturedPieces(game.chess.chessBoard, hisSideColor) : [];

  return (
	<div className="flex min-h-screen flex-col">
	  {game && receivedDrawOffer && (
		<DrawOfferDialog
		  key={receivedDrawOffer.id}
		  delayMs={game.draw.responseDelayMs}
		  pending={drawResponsePending}
		  error={error}
		  onRespond={respondToDraw}
		/>
	  )}

	  <main>
		<Header />

		<section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8">
		  <div className="w-full max-w-6xl">
			
			<div className="relative mx-auto mb-6 w-full max-w-4xl">
			  {game && (
				<div className={`flex items-center gap-3 justify-self-start rounded-2xl border border-white/20 container-theme-${theme} px-5 py-3 shadow-lg backdrop-blur-lg`}>
				  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-xl font-bold">
					O
				  </div>
				  <div>
					<p className="text-lg font-bold">
					  {game.bot ? `Stockfish · ${game.bot.difficulty}` : "Opponent"}
					</p>
					<p className="text-sm text-white/70">
					  {game.bot ? "Computer opponent" : "1200 Elo"}
					</p>
				  </div>
				</div>
			  )}

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

			  {game && (
				<div className={`justify-self-end rounded-2xl border border-white/20 container-theme-${theme} px-6 py-3 font-mono text-xl shadow-lg backdrop-blur-lg`}>
				  00:00
				</div>
			  )}
			</div>

			<div className="mx-auto grid w-full min-w-0 grid-cols-1 items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,auto)_minmax(0,660px)_minmax(0,auto)] lg:justify-center">
			  <div className="order-2 mx-auto w-full min-w-0 max-w-[660px] lg:order-1 lg:w-auto">
				{searchingGame ? (
				  <div className={`hidden w-56 shrink-0 rounded-2xl border border-white/20 container-theme-${theme} p-4 shadow-lg lg:block`}>
					<p className="text-sm text-white/70">Game ID:</p>
					<p className="mb-2 font-mono text-sm">{searchingGame.id}</p>
					<div className="space-y-1">
					  <p className="text-sm">
						<span className="text-white/70">White:</span> {searchingGame.white}
					  </p>
					  <p className="text-sm">
						<span className="text-white/70">Black:</span> {searchingGame.black ?? "Waiting..."}
					  </p>
					</div>
				  </div>
				) : (
				  <CapturedTray
					pieces={capturedByMe}
					label="Captured by you"
					pieceImages={appearance.pieceImages}
				  />
				)}
			  </div>

			  <div className="order-1 mx-auto aspect-square w-full min-w-0 max-w-[660px] lg:order-2">
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
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
				  />
				) : (
				  <div className={`flex aspect-square items-center justify-center rounded-2xl border border-white/20 container-theme-${theme} shadow-2xl backdrop-blur-lg`}>
					<div className="text-center">
					  <div className="mb-4 text-6xl">♛</div>
					  <p className="text-lg text-white/80">Create or join a game</p>
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

			  <div className="order-3 mx-auto w-full min-w-0 max-w-[660px] lg:order-3 lg:w-auto">
				{searchingGame ? (
				  <div className="hidden w-56 shrink-0 lg:block" aria-hidden="true" />
				) : (
				  <CapturedTray
					pieces={capturedByOpponent}
					label="Captured by opponent"
					pieceImages={appearance.pieceImages}
				  />
				)}
			  </div>
			</div>

			{game && (
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
			)}
		  </div>
		</section>
	  </main>

	  <Footer />
	</div>
  );
}

export default Chess;
