import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import DrawOfferDialog from "../components/DrawOfferDialog";
import socket from "../services/socket";
import { getMyProfile } from "../services/users";

import bb from "../assets/pieces/bb.svg";
import bw from "../assets/pieces/bw.svg";
import kb from "../assets/pieces/kb.svg";
import kw from "../assets/pieces/kw.svg";
import nb from "../assets/pieces/nb.svg";
import nw from "../assets/pieces/nw.svg";
import pb from "../assets/pieces/pb.svg";
import pw from "../assets/pieces/pw.svg";
import qb from "../assets/pieces/qb.svg";
import qw from "../assets/pieces/qw.svg";
import rb from "../assets/pieces/rb.svg";
import rw from "../assets/pieces/rw.svg";

import shapeB from "../assets/pieces_shape/b.svg";
import shapeK from "../assets/pieces_shape/k.svg";
import shapeN from "../assets/pieces_shape/n.svg";
import shapeP from "../assets/pieces_shape/p.svg";
import shapeQ from "../assets/pieces_shape/q.svg";
import shapeR from "../assets/pieces_shape/r.svg";


const borderThemeClass = "rounded-2xl overflow-hidden border-8 border-olive-950";
const whiteCaseClass = "bg-gradient-to-br from-stone-600 via-stone-300 to-white";
const darkCaseClass = "bg-gradient-to-br from-black via-stone-800 to-black";

type ChessPiece = {
	chessPieceType: string;
	chessPieceColor: "white" | "black";
} | null;

type ChessMove = {
	chessPlayerColor: "white" | "black";
	startingSquare: string;
	targetSquare: string;
	chessPieceType: string;
	capturedChessPieceType: string | null;
	promotionChessPieceType: string | null;
	standardAlgebraicNotation: string;
};

type LegalMove = Omit<ChessMove, "chessPlayerColor">;

type ChessGame = {
	id: string;
	white: string;
	black: string | null;
	bot: { difficulty: "easy" | "medium" | "hard"} | null;
	draw: {
		offer: { id: string; offeredBy: string; responseAvailableAt: number } | null;
		offersMade: { white: number; black: number };
		maxOffers: number;
		responseDelayMs: number;
	};
	chess: {
		chessBoard: ChessPiece[][];
		currentPlayerColor: "white" | "black";
		isGameFinished: boolean;
		chessGameResult: string | null;
		chessGameEndReason: string | null;
		isCurrentPlayerInCheck: boolean;
		currentPositionFen: string;
		moveHistory: ChessMove[];
	};
};

const caseBoard = [
	["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
	["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
	["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
	["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
	["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
	["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
	["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
	["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"],
];

function getPieceImage(piece: ChessPiece) {
	if (!piece) {
		return undefined;
	}

	if (piece.chessPieceColor === "white") {
		switch (piece.chessPieceType) {
			case "pawn":
				return pw;
			case "rook":
				return rw;
			case "knight":
				return nw;
			case "bishop":
				return bw;
			case "queen":
				return qw;
			case "king":
				return kw;
		}
	}

	if (piece.chessPieceColor === "black") {
		switch (piece.chessPieceType) {
			case "pawn":
				return pb;
			case "rook":
				return rb;
			case "knight":
				return nb;
			case "bishop":
				return bb;
			case "queen":
				return qb;
			case "king":
				return kb;
		}
	}

	return undefined;
}

function getPieceSilhouette(chessPieceType: string) {
	switch (chessPieceType) {
		case "pawn":
			return shapeP;
		case "rook":
			return shapeR;
		case "knight":
			return shapeN;
		case "bishop":
			return shapeB;
		case "queen":
			return shapeQ;
		case "king":
			return shapeK;
	}

	return undefined;
}

const CAPTURED_PIECE_ORDER = [
	"queen",
	"rook",
	"bishop",
	"knight",
	"pawn",
] as const;

const CAPTURED_PIECE_SLOT_LAYOUT = [
	"queen",
	"rook",
	"rook",
	"bishop",
	"bishop",
	"knight",
	"knight",
	"pawn",
	"pawn",
	"pawn",
	"pawn",
	"pawn",
	"pawn",
	"pawn",
	"pawn",
] as const;

const CAPTURED_PIECE_RANK = new Map<string, number>(
	CAPTURED_PIECE_ORDER.map((type, index) => [type, index] as const),
);

type ChessPieceData = NonNullable<ChessPiece>;

function getCapturedPieces(
	moveHistory: ChessMove[],
	capturedColor: "white" | "black",
): ChessPieceData[] {
	const captured: ChessPieceData[] = [];

	for (const move of moveHistory) {
		if (
			move.capturedChessPieceType === null
			|| move.chessPlayerColor === capturedColor
		) {
			continue;
		}

		captured.push({
			chessPieceType: move.capturedChessPieceType,
			chessPieceColor: capturedColor,
		});
	}

	return captured.sort(
		(a, b) =>
			(CAPTURED_PIECE_RANK.get(a.chessPieceType) ?? CAPTURED_PIECE_ORDER.length)
			- (CAPTURED_PIECE_RANK.get(b.chessPieceType) ?? CAPTURED_PIECE_ORDER.length),
	);
}

function getCapturedSlots(pieces: ChessPieceData[]) {
	const availablePieces = new Map<string, ChessPieceData[]>();

	for (const piece of pieces) {
		const piecesOfType = availablePieces.get(piece.chessPieceType) ?? [];
		piecesOfType.push(piece);
		availablePieces.set(piece.chessPieceType, piecesOfType);
	}

	return CAPTURED_PIECE_SLOT_LAYOUT.map((type) => ({
		type,
		piece: availablePieces.get(type)?.shift() ?? null,
	}));
}

function CapturedTray({
	pieces,
	label,
	backgroundClassName = "bg-gradient-to-r from-red-700 to-orange-500",
}: {
	pieces: ChessPieceData[];
	label: string;
	backgroundClassName?: string;
}) {
	const slots = getCapturedSlots(pieces);

	return (
		<div className={`flex h-full w-full flex-col items-center p-3 shadow-2xl ring-4 ring-purple-500/20 ${backgroundClassName} ${borderThemeClass}`}>
			<p className="mb-2 shrink-0 text-center text-xs font-semibold uppercase tracking-wider text-white/60">
				{label}
				{pieces.length > 0 && (
					<span className="ml-1 text-white/40">({pieces.length})</span>
				)}
			</p>

			<div className="grid min-h-0 w-full flex-1 grid-cols-3 grid-rows-5 place-items-center gap-1">
				{slots.map(({ type, piece }, index) => (
					<img
						key={`${type}-${index}`}
						src={(piece ? getPieceImage(piece) : getPieceSilhouette(type)) ?? undefined}
						alt={piece ? type : ""}
						aria-hidden={piece ? undefined : true}
						className={`h-full w-full object-contain ${piece ? "drop-shadow-md" : "opacity-40"}`}
					/>
				))}
			</div>
		</div>
	);
}

function Chess() {
	const theme = "blue";
	const [game, setGame] = useState<ChessGame | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [joinGameId, setJoinGameId] = useState("");
	const [showJoinInput, setShowJoinInput] = useState(false);
	const [showBotInput, setShowBotInput] = useState(false);
	const [botDifficulty, setBotDifficulty] = useState<"easy" | "medium" | "hard">("medium");
	const [botError, setBotError] = useState(false);
	const [drawResponsePending, setDrawResponsePending] = useState(false);
	const [myAuthId, setMyAuthId] = useState<string | null>(null);

	let myColor: "white" | "black" | null = null;

	if (game && myAuthId) {
		if (game.white === myAuthId) {
			myColor = "white";
		}
		else if (game.black === myAuthId) {
			myColor = "black";
		}
	}

	const [draggedPiece, setDraggedPiece] = useState<{
		row: number;
		col: number;
		piece: ChessPiece;
	} | null>(null);

	
	const [selectedSquare, setSelectedSquare] = useState<{
		row: number;
		col: number;
	} | null>(null);

	const [promotionSquare, setPromotionSquare] = useState<{
		startingSquare: string;
		targetSquare: string;
		pieceColor: "white" | "black";
	} | null>(null);

	const [legalMoves, setLegalMoves] = useState<LegalMove[]>([]);

	const [mousePosition, setMousePosition] = useState({
		x: 0,
		y: 0,
	});


	useEffect(() => {
		async function loadProfile() {
			const result = await getMyProfile();

			if (result.ok) {
				setMyAuthId(result.data.authId);
			}
		}

		loadProfile();
	}, []);

	useEffect(() => {
		function updateGame(gameState: ChessGame) {
			setDrawResponsePending(false);
			setPromotionSquare(null);
			if (!gameState) {
				setGame(null);
				return;
			}
			console.log("GAME RECUE :", gameState);
			console.log("BOARD RECUE :", gameState.chess?.chessBoard);

			setGame(gameState);
			setDraggedPiece(null);
			setSelectedSquare(null);
			setLegalMoves([]);
			setError("");
			setBotError(false);
		}

		function handleGameActive(gameState: ChessGame | null) {
			setGame(gameState);
			setDraggedPiece(null);
			setSelectedSquare(null);
			setLegalMoves([]);
			setDrawResponsePending(false);
			// Allow recovery if a bot failure happened while this client was offline.
			setBotError(Boolean(gameState?.bot && gameState.chess.currentPlayerColor === "black"));
		}

		function handleLegalMoves(data: {
			startingSquare: string;
			legalMoves: LegalMove[];
		}) {
			setLegalMoves(data.legalMoves);
		}

		function handleGameError(data: { message: string }) {
			console.error(data.message);
			setError(data.message);
			setDraggedPiece(null);
			setDrawResponsePending(false);
		}
		function handleDrawUpdated(gameState: ChessGame) {
			setGame(gameState);
			setDraggedPiece(null);
			setSelectedSquare(null);
			setLegalMoves([]);
			setPromotionSquare(null);
			setDrawResponsePending(false);
			setError(null);
		}
		function handleBotError(data: { message: string }) {
			setError(data.message);
			setBotError(true);
		}
		function refreshGame() { socket.emit("game:get-active"); }

		socket.on("game:created", updateGame);
		socket.on("game:ready", updateGame);
		socket.on("game:updated", updateGame);
		socket.on("game:ended", updateGame);

		socket.on("game:active", handleGameActive);
		socket.on("game:legal-moves", handleLegalMoves);
		socket.on("game:error", handleGameError);
		socket.on("game:bot-error", handleBotError);
		socket.on("game:draw-updated", handleDrawUpdated);
		socket.on("connect", refreshGame);

		socket.emit("game:get-active");

		return () => {
			socket.off("game:created", updateGame);
			socket.off("game:ready", updateGame);
			socket.off("game:updated", updateGame);
			socket.off("game:ended", updateGame);

			socket.off("game:active", handleGameActive);
			socket.off("game:legal-moves", handleLegalMoves);
			socket.off("game:error", handleGameError);
			socket.off("game:bot-error", handleBotError);
			socket.off("game:draw-updated", handleDrawUpdated);
			socket.off("connect", refreshGame);
		};
	}, []);

	function askID() {
		if (searchingGame && myAuthId && searchingGame.white === myAuthId) {
			socket.emit("game:leave", searchingGame.id);
			setGame(null);
			setLegalMoves([]);
			setDraggedPiece(null);
			setSelectedSquare(null);
		}

		setShowJoinInput(true);
		setShowBotInput(false);
		setError(null);
	}

	function askDifficulty() {
		if (searchingGame && myAuthId && searchingGame.white === myAuthId) {
			socket.emit("game:leave", searchingGame.id);
			setGame(null);
			setLegalMoves([]);
			setDraggedPiece(null);
			setSelectedSquare(null);
		}

		setShowBotInput(true);
		setShowJoinInput(false);
		setError(null);
	}

	function createGame() {
		setError(null);
		setShowJoinInput(false);
		setShowBotInput(false);
		socket.emit("game:create");
	}

	function createBotGame() {
		setError(null);
		setBotError(false);
		socket.emit("game:create", { mode: "bot", difficulty: botDifficulty });
	}

	function joinGame() {
		
		const gameId = joinGameId.trim();

		if (gameId === "") {
			return;
		}

		setError(null);
		socket.emit("game:join", gameId);
		setJoinGameId("");
	}

	function cancelGame() {
		if (!game)
			return;

		socket.emit("game:leave", game.id);

		setGame(null);
		setJoinGameId("");
		setLegalMoves([]);
	}

	function resignGame() {
		if (!game)
			return;

		socket.emit("game:resign", game.id);
	}

	function offerDraw() {
		if (!game) return;
		setError(null);
		socket.emit("game:offer-draw", { gameId: game.id });
	}

	function respondToDraw(accept: boolean) {
		if (!game || !game.draw.offer || drawResponsePending) return;
		setError(null);
		setDrawResponsePending(true);
		socket.emit("game:respond-draw", {
			gameId: game.id,
			offerId: game.draw.offer.id,
			accept: accept,
		});
	}

	function endGame() {
		if (!game)
			return;

		setError("");
		setJoinGameId("");
		setLegalMoves([]);
		setGame(null);
	}

	function getEndReasonText(reason: string | null) {
		switch (reason) {
			case "checkmate":
				return "Mat";
			case "resignation":
				return "Give up";
			case "stalemate":
				return "Pat";
			case "draw":
				return "Null";
			case "agreement":
				return "Draw by agreement";
			default:
				return "Game over";
		}
	}

	function getGameResult(result: string | null) {
		if (result === "draw") {
			return "Draw";
		}

		if (result === "whitePlayerWon") {
			return myColor === "white"
				? "Victoire"
				: "Défaite";
		}

		if (result === "blackPlayerWon") {
			return myColor === "black"
				? "Victoire"
				: "Défaite";
		}

		return "Partie terminée";
	}

	function getBackendCoordinates(row: number, col: number) {
		if (myColor === "black") {
			return {
				row: 7 - row,
				col: 7 - col,
			};
		}

		return {
			row,
			col,
		};
	}

	
	function handleSquareClick(row: number, col: number) {
		if (!game || game.chess.isGameFinished || game.draw.offer !== null) {
			return;
		}

		const {
			row: backendRow,
			col: backendCol,
		} = getBackendCoordinates(row, col);

		const piece = game.chess.chessBoard[backendRow][backendCol];
		const square = displayedCaseBoard[row][col];

		if (selectedSquare) {
			const {
				row: startBackendRow,
				col: startBackendCol,
			} = getBackendCoordinates(
				selectedSquare.row,
				selectedSquare.col
			);

			const startingSquare =
				caseBoard[startBackendRow][startBackendCol];

			const moveIsLegal = legalMoves.some(
				(move) => move.targetSquare === square
			);

			if (moveIsLegal) {
				const selectedPiece =
					game.chess.chessBoard[startBackendRow][startBackendCol];

				const isPromotion =
					selectedPiece?.chessPieceType === "pawn" &&
					(
						(selectedPiece.chessPieceColor === "white" &&
							square[1] === "8") ||
						(selectedPiece.chessPieceColor === "black" &&
							square[1] === "1")
					);

				if (isPromotion && selectedPiece) {
					setPromotionSquare({
						startingSquare,
						targetSquare: square,
						pieceColor: selectedPiece.chessPieceColor,
					});
				} else {
					socket.emit("game:move", {
						gameId: game.id,
						move: {
							startingSquare,
							targetSquare: square,
						},
					});
				}

				setSelectedSquare(null);
				setLegalMoves([]);
				setDraggedPiece(null);
				return;
			}
		}

		if (piece && piece.chessPieceColor === game.chess.currentPlayerColor) {
			setSelectedSquare({ row, col });

			socket.emit("game:get-legal-moves", {
				gameId: game.id,
				startingSquare: square,
			});

			return;
		}

		setSelectedSquare(null);
		setLegalMoves([]);
	}

	const handleMouseDown = (
		event: React.MouseEvent,
		row: number,
		col: number
	) => {
		if (!game) {
			return;
		}

		const { row: backendRow, col: backendCol } =
			getBackendCoordinates(row, col);

		const piece = game.chess.chessBoard[backendRow][backendCol];
		if (game.chess.isGameFinished || !game.black
			|| game.draw.offer !== null
			|| game.chess.currentPlayerColor !== myColor || piece?.chessPieceColor !== myColor) return;

		if (piece === null) {
			return;
		}

		event.preventDefault();

		const startingSquare = caseBoard[backendRow][backendCol];

		socket.emit("game:get-legal-moves", {
			gameId: game.id,
			startingSquare,
		});

		setDraggedPiece({
			row,
			col,
			piece,
		});

		setMousePosition({
			x: event.clientX,
			y: event.clientY,
		});
	};

	const handleMouseMove = (event: React.MouseEvent) => {
		if (!draggedPiece) {
			return;
		}

		setMousePosition({
			x: event.clientX,
			y: event.clientY,
		});
	};

	const handleMouseUp = (event: React.MouseEvent) => {
		if (!draggedPiece || !game || game.draw.offer !== null) {
			return;
		}

		const boardElement = event.currentTarget as HTMLElement;
		const rect = boardElement.getBoundingClientRect();

		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		if (
			x < 0 ||
			y < 0 ||
			x > rect.width ||
			y > rect.height
		) {
			setDraggedPiece(null);
			setLegalMoves([]);
			return;
		}

		const squareWidth = rect.width / 8;
		const squareHeight = rect.height / 8;

		const targetCol = Math.floor(x / squareWidth);
		const targetRow = Math.floor(y / squareHeight);

		const {
			row: startBackendRow,
			col: startBackendCol,
		} = getBackendCoordinates(
			draggedPiece.row,
			draggedPiece.col
		);

		const startingSquare =
			caseBoard[startBackendRow][startBackendCol];

		const {
			row: targetBackendRow,
			col: targetBackendCol,
		} = getBackendCoordinates(
			targetRow,
			targetCol
		);

		const targetSquare =
			caseBoard[targetBackendRow][targetBackendCol];

		const moveIsLegal = legalMoves.some(
			(move) => move.targetSquare === targetSquare
		);

		if (!moveIsLegal) {
			setDraggedPiece(null);
			setLegalMoves([]);
			return;
		}

		const piece = draggedPiece.piece;

		const isPromotion =
			piece?.chessPieceType === "pawn" &&
			(
				(piece.chessPieceColor === "white" && targetSquare[1] === "8") ||
				(piece.chessPieceColor === "black" && targetSquare[1] === "1")
			);

		if (isPromotion) {
			setPromotionSquare({
				startingSquare,
				targetSquare,
				pieceColor: piece.chessPieceColor,
			});

			setDraggedPiece(null);
			setLegalMoves([]);

			return;
		}

		socket.emit("game:move", {
			gameId: game.id,
			move: {
				startingSquare,
				targetSquare,
			},
		});

		setDraggedPiece(null);
		setLegalMoves([]);
	};

	type PromotionPiece = "queen" | "rook" | "bishop" | "knight";
	function promote(pieceType: PromotionPiece) {
		if (!promotionSquare || !game) {
			return;
		}

		socket.emit("game:move", {
			gameId: game.id,
			move: {
				startingSquare: promotionSquare.startingSquare,
				targetSquare: promotionSquare.targetSquare,
				promotionChessPieceType: pieceType,
			},
		});

		setPromotionSquare(null);
	}

	const displayedBoard =
		myColor === "black"
			? [...game?.chess.chessBoard ?? []]
					.reverse()
					.map((row) => [...row].reverse())
			: game?.chess.chessBoard ?? [];

	const displayedCaseBoard =
		myColor === "black"
			? [...caseBoard].reverse().map((row) => [...row].reverse())
			: caseBoard;

	const mySideColor =
		myColor === "white" || myColor === "black" ? myColor : null;

	const hisSideColor =
		mySideColor === "white"
			? "black"
			: mySideColor === "black"
				? "white"
				: null;

	const capturedByMe =
		game && hisSideColor
			? getCapturedPieces(game.chess.moveHistory, hisSideColor)
			: [];

	const capturedByOpponent =
		game && mySideColor
			? getCapturedPieces(game.chess.moveHistory, mySideColor)
			: [];

	const searchingGame =
		game && !game.chess.isGameFinished && game.black === null
			? game
			: null;

	let receivedDrawOffer: ChessGame["draw"]["offer"] = null;
	let drawOffersMade = 0;
	if (game && myColor) {
		drawOffersMade = game.draw.offersMade[myColor];
		if (!game.chess.isGameFinished && game.draw.offer !== null
			&& game.draw.offer.offeredBy !== myAuthId) {
			receivedDrawOffer = game.draw.offer;
		}
	}

	let drawButtonColors;
	if (drawOffersMade >= 3) {
		drawButtonColors = "from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500";
	} else {
		drawButtonColors = "from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500";
	}

	return (
		<div className="min-h-screen flex flex-col">
		{game && receivedDrawOffer && (
			<DrawOfferDialog key={receivedDrawOffer.id}
				delayMs={game.draw.responseDelayMs} pending={drawResponsePending}
				error={error} onRespond={respondToDraw} />
		)}
		<main>
			<Header />

			<section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-6xl">

					
					<div className="mx-auto mb-6 grid w-[min(660px,100%,calc(100vh-475px))] grid-cols-[1fr_auto_1fr] items-center gap-4">


						<div className="justify-self-center">

							{error && (
								<p className="mt-4 text-red-400">
									{error}
								</p>
							)}

							{game?.bot && !game.chess.isGameFinished && game.chess.currentPlayerColor === "black" && (
								<div className="mt-3 text-center" aria-live="polite">
									{botError ? <button className="rounded-xl bg-violet-600 px-4 py-2"
										onClick={() => { setBotError(false); setError(null); socket.emit("game:retry-bot", game.id); }}>
										Retry bot turn
									</button> : "Stockfish is thinking…"}
								</div>
							)}

							{game && game?.chess.isGameFinished && (
								<div className={`flex flex-col items-center justify-center rounded-2xl container-theme-${theme} backdrop-blur-xl border border-white/30 px-6 py-8 text-center shadow-2xl`}>
									<p
										className={`text-2xl font-bold mb-2 ${ game.chess.chessGameResult === "draw" ? "text-amber-300" : getGameResult(game.chess.chessGameResult) === "Victoire" ? "text-emerald-300" : "text-rose-300" }`}
									>
										{getGameResult(game.chess.chessGameResult)}
									</p>

									<p className="text-sm /70">
										{getEndReasonText(game.chess.chessGameEndReason)}
									</p>

									<button
										onClick={endGame}
										className="mt-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-semibold transition-all hover:from-violet-400 hover:to-fuchsia-400 transform hover:scale-105"
									>
										New game
									</button>
								</div>
							)}
						</div>

					</div>
				

					{(!game || game.black === null) && (
					<div className={`grid aspect-square bg-black justify-self-center w-164 h-16 grid-cols-3 grid-rows-1 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/20 ${borderThemeClass}`}> 
						{searchingGame && (
						<button
							className="select-text rounded-xl bg-gradient-to-r from-cyan-700 to-sky-300 justify-self-start w-164 h-12 font-semibold shadow-lg"
						>
							{game.id}
						</button>
						)}
						{showBotInput && (
						<div className="rounded-xl bg-gradient-to-r from-cyan-700 to-sky-300 justify-self-start w-164 h-12 font-semibold shadow-lg">
						<div className="relative justify-self-center w-full h-full">
							<select aria-label="Bot difficulty" value={botDifficulty}
								onChange={(event) => {
								setBotDifficulty(event.target.value as "easy" | "medium" | "hard");
								}}
								onClick={(event) => { 
								createBotGame();
								}}
								className={`w-full cursor-pointer appearance-none rounded-xl border border-white/20 backdrop-blur-lg py-3 pl-4 pr-11 text-sm text-center font-semibold text-white shadow-lg outline-none transition duration-200 hover:border-white/40 focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/30`}
								style={{ colorScheme: "dark" }}>
								<option className="bg-[#194b7b]  font-semibold" value="easy">Easy</option>
								<option className="bg-[#194b7b]  font-semibold" value="medium">Medium</option>
								<option className="bg-[#194b7b]  font-semibold" value="hard">Hard</option>
							</select>
							<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
								className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70">
								<path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						</div>
						)}

						{showJoinInput && (
						<div className="rounded-xl bg-gradient-to-r from-cyan-700 to-sky-300 justify-self-start w-164 h-12 font-semibold shadow-lg">
						<input
							type="text"
							placeholder="   Paste game ID here"
							value={joinGameId}
							onChange={(event) =>
								setJoinGameId(event.target.value)
							}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									joinGame();
								}
							}}
							className={`rounded-xl border border-white/20 backdrop-blur-lg w-full h-full outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20`}
						/>
						</div>
						)}

						{!showJoinInput && !showBotInput && !searchingGame && (
						<div className="flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-700 to-sky-300 w-164 h-12 font-semibold shadow-lg text-white">
							Create or join a game
						</div>
						)}

					</div>
					)}

					{game && game.black !== null && (
						<div className={`grid aspect-square bg-black justify-self-center w-164 h-16 grid-cols-3 grid-rows-1 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/20 ${borderThemeClass}`}>
							<button
								className="rounded-xl bg-gradient-to-r from-red-700 to-orange-500 justify-self-start w-52 h-12 font-semibold shadow-lg"
							>
								1200 Elo
							</button>
							<button 
								className="rounded-xl bg-gradient-to-r from-red-700 to-orange-500 justify-self-center w-52 h-12 font-semibold shadow-lg"
							>
								Opponent
							</button>
							<button
								className="rounded-xl bg-gradient-to-r from-red-700 to-orange-500 justify-self-end w-52 h-12 font-semibold shadow-lg"
							>
								00:00
							</button>
						</div>						
					)}

					<br></br>

					{(!game || (game && !game?.chess.isGameFinished && game.black === null)) && (
					<div className={`grid aspect-square bg-black justify-self-center w-164 h-16 grid-cols-3 grid-rows-1 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/20 ${borderThemeClass}`}>
						<button
							onClick={createGame}
							className="rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 justify-self-start w-52 h-12 font-semibold shadow-lg hover:from-emerald-600 hover:to-green-400 transition-all"
						>
							Create a game
						</button>
						<button 
							onClick={askDifficulty}
							className="rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 justify-self-center w-52 h-12 font-semibold shadow-lg hover:from-emerald-600 hover:to-green-400 transition-all"
						>
							Play against bot
						</button>
						<button
							onClick={askID}
							className="rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 justify-self-end w-52 h-12 font-semibold shadow-lg hover:from-emerald-600 hover:to-green-400 transition-all"
						>
							Join a game
						</button>
					</div>
					)}

					<br></br>

					<div className="mx-auto flex w-full items-stretch justify-center gap-4">

						<div className="relative hidden w-56 shrink-0 lg:block">
							{game && game.black !== null && (
								<div className="absolute inset-0">
									<CapturedTray
										pieces={capturedByMe}
										label="Captured by you"
										backgroundClassName="bg-gradient-to-r from-cyan-900 to-teal-500"
									/>
								</div>
							)}
						</div>

						<div className="aspect-square w-[min(660px,100%,calc(100vh-475px))]">
							{game ? (
								<div
									className={`grid aspect-square w-full grid-cols-8 grid-rows-8 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/20 ${borderThemeClass}`}
									onMouseMove={handleMouseMove}
									onMouseUp={handleMouseUp}
								>
									{displayedBoard.map((row, rowIndex) =>
										row.map((piece, columnIndex) => {
											const pieceImage = getPieceImage(piece);
											const isDark = (rowIndex + columnIndex) % 2 === 1;
											const square = displayedCaseBoard[rowIndex][columnIndex];
											const isDragging =
												draggedPiece?.row === rowIndex &&
												draggedPiece?.col === columnIndex;																						
											const isSelected =
												selectedSquare?.row === rowIndex &&
												selectedSquare?.col === columnIndex;											
											const isKingInCheck =
												game !== null &&
												game.chess.isCurrentPlayerInCheck &&
												piece?.chessPieceType === "king" &&
												piece.chessPieceColor === game.chess.currentPlayerColor;
											const isLegalMove = legalMoves.some(
												(move) => move.targetSquare === square
											);

											return (
												<div
													key={`${rowIndex}-${columnIndex}`}
													onClick={() => handleSquareClick(rowIndex, columnIndex)}
													onMouseDown={(event) =>
														handleMouseDown(event, rowIndex, columnIndex)
													}
													className={`relative flex aspect-square select-none items-center justify-center cursor-grab transition-all
														${isDragging ? "opacity-30 scale-105" : ""} ${isDark ? darkCaseClass : whiteCaseClass} ${isSelected ? "ring-4 ring-inset ring-violet-400" : ""} ${isKingInCheck ? "ring-4 ring-inset ring-red-500" : ""}`}
												>
													{pieceImage && (
														<img
															src={pieceImage}
															alt=""
															draggable={false}
															className={`pointer-events-none h-[114%] w-[114%] object-contain drop-shadow-lg`}
														/>
													)}

													{isLegalMove && !pieceImage && (
														<div className="pointer-events-none absolute h-5 w-5 rounded-full bg-violet-500/80 shadow-lg animate-pulse" />
													)}

													{isLegalMove && pieceImage && (
														<div className="pointer-events-none absolute inset-1 rounded-full border-4 border-fuchsia-400/90 shadow-inner" />
													)}
												</div>
											);
										})
									)}

									{draggedPiece && (
										<img
											src={getPieceImage(draggedPiece.piece)}
											alt=""
											draggable={false}
											className="pointer-events-none fixed z-50 h-[125px] w-[125px] object-contain drop-shadow-2xl"
											style={{
												left: mousePosition.x - 48,
												top: mousePosition.y - 48,
											}}
										/>
									)}
								</div>
							) : (
								<div className={`flex aspect-square items-center justify-center rounded-2xl container-theme-${theme} backdrop-blur-lg border border-white/20 shadow-2xl`}>
									<div className="text-center">
										<div className="text-6xl mb-4">♛</div>
									</div>
								</div>
							)}

							{promotionSquare && (
								<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
									<div className="rounded-3xl bg-gradient-to-br from-purple-900/95 to-indigo-950/95 border border-white/30 p-8 shadow-2xl">
										<h2 className="mb-6 text-center text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
											Promotion
										</h2>

										<div className="flex gap-4">
											{[
												{ type: "queen" as PromotionPiece, image: promotionSquare.pieceColor === "white" ? qw : qb, alt: "Dame" },
												{ type: "rook" as PromotionPiece, image: promotionSquare.pieceColor === "white" ? rw : rb, alt: "Tour" },
												{ type: "bishop" as PromotionPiece, image: promotionSquare.pieceColor === "white" ? bw : bb, alt: "Fou" },
												{ type: "knight" as PromotionPiece, image: promotionSquare.pieceColor === "white" ? nw : nb, alt: "Cavalier" },
											].map((piece) => (
												<button
													key={piece.type}
													onClick={() => promote(piece.type)}
													className={`flex h-28 w-24 items-center justify-center rounded-2xl container-theme-${theme} border border-white/20 transition-all hover:opacity-90 hover:scale-110 shadow-lg`}
												>
													<img
														src={piece.image}
														alt={piece.alt}
														className="h-20 w-20 object-contain drop-shadow-lg"
													/>
												</button>
											))}
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="relative hidden w-56 shrink-0 lg:block">
							{game && game.black !== null && (
								<div className="absolute inset-0">
									<CapturedTray
										pieces={capturedByOpponent}
										label="Captured by opponent"
									/>
								</div>
							)}
						</div>
					</div>

					<br></br>
											
					{game && game.black !== null && (
						<div className={`grid aspect-square bg-black justify-self-center w-164 h-16 grid-cols-3 grid-rows-1 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-purple-500/20 ${borderThemeClass}`}>
							<button
								onClick={resignGame}
								className="rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 justify-self-start w-52 h-12 font-semibold shadow-lg hover:from-emerald-600 hover:to-green-400 transition-all"
							>
								Give up
							</button>
							<button 
								onClick={offerDraw}
								disabled={!game || !myColor || !game.black || game.chess.isGameFinished || Boolean(game.bot)}
								title={game?.bot ? "Draw offers are only available in two-player games." : "Offer your opponent a draw"}
								className="rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 justify-self-center w-52 h-12 font-semibold shadow-lg hover:from-emerald-600 hover:to-green-400 transition-all"
							>
								Offer draw ({drawOffersMade}/3)
							</button>
							<button
								className="rounded-xl bg-gradient-to-r from-cyan-900 to-teal-500 justify-self-end w-52 h-12 font-semibold shadow-lg"
							>
								00:00
							</button>
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
