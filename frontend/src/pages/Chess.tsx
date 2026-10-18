import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Footer from "../components/Footer";
import Header from "../components/Header";
import socket from "../services/socket";
import { getRandomInt } from "../utils/random";
import { getMyProfile } from "../services/users";

import bbp from "../assets/pieces_pink/bb.svg";
import bwp from "../assets/pieces_pink/bw.svg";
import kbp from "../assets/pieces_pink/kb.svg";
import kwp from "../assets/pieces_pink/kw.svg";
import nbp from "../assets/pieces_pink/nb.svg";
import nwp from "../assets/pieces_pink/nw.svg";
import pbp from "../assets/pieces_pink/pb.svg";
import pwp from "../assets/pieces_pink/pw.svg";
import qbp from "../assets/pieces_pink/qb.svg";
import qwp from "../assets/pieces_pink/qw.svg";
import rbp from "../assets/pieces_pink/rb.svg";
import rwp from "../assets/pieces_pink/rw.svg";

import bbl from "../assets/pieces_blue/bb.svg";
import bwl from "../assets/pieces_blue/bw.svg";
import kbl from "../assets/pieces_blue/kb.svg";
import kwl from "../assets/pieces_blue/kw.svg";
import nbl from "../assets/pieces_blue/nb.svg";
import nwl from "../assets/pieces_blue/nw.svg";
import pbl from "../assets/pieces_blue/pb.svg";
import pwl from "../assets/pieces_blue/pw.svg";
import qbl from "../assets/pieces_blue/qb.svg";
import qwl from "../assets/pieces_blue/qw.svg";
import rbl from "../assets/pieces_blue/rb.svg";
import rwl from "../assets/pieces_blue/rw.svg";

import bbb from "../assets/pieces_brown/bb.svg";
import bwb from "../assets/pieces_brown/bw.svg";
import kbb from "../assets/pieces_brown/kb.svg";
import kwb from "../assets/pieces_brown/kw.svg";
import nbb from "../assets/pieces_brown/nb.svg";
import nwb from "../assets/pieces_brown/nw.svg";
import pbb from "../assets/pieces_brown/pb.svg";
import pwb from "../assets/pieces_brown/pw.svg";
import qbb from "../assets/pieces_brown/qb.svg";
import qwb from "../assets/pieces_brown/qw.svg";
import rbb from "../assets/pieces_brown/rb.svg";
import rwb from "../assets/pieces_brown/rw.svg";

let borderThemeClass: string;
let whiteCaseClass: string;
let darkCaseClass: string;
let bb: string;
let bw: string;
let kb: string;
let kw: string;
let nb: string;
let nw: string;
let pb: string;
let pw: string;
let qb: string;
let qw: string;
let rb: string;
let rw: string;

const rand1 = getRandomInt(1, 3);
const rand2 = getRandomInt(1, 3);
switch (rand1)
{

    case 1:
	  borderThemeClass = "rounded-2xl overflow-hidden border-8 border-olive-950";
	  whiteCaseClass = "bg-gradient-to-br from-stone-600 via-stone-300 to-white";
	  darkCaseClass = "bg-gradient-to-br from-black via-stone-800 to-black";
	  break;

    case 2:
      borderThemeClass = "rounded-2xl overflow-hidden border-8 border-indigo-950";
	  whiteCaseClass = "bg-gradient-to-br from-cyan-300 via-sky-350 to-white";
	  darkCaseClass = "bg-gradient-to-br from-cyan-900 via-sky-950 to-black";
	  break;

    default:
	  borderThemeClass = "rounded-2xl overflow-hidden border-8 border-amber-950";
	  whiteCaseClass = "bg-gradient-to-br from-pink-200 via-rose-300 to-white";
	  darkCaseClass = "bg-gradient-to-br from-rose-400 via-pink-350 to-black";
}

switch (rand2)
{
	case 1:
	  bb = bbb;
	  bw = bwb;
	  kb = kbb;
	  kw = kwb;
	  nb = nbb;
	  nw = nwb;
	  pb = pbb;
	  pw = pwb;
	  qb = qbb;
	  qw = qwb;
	  rb = rbb;
	  rw = rwb;
	  break;

	case 2:
	  bb = bbl;
	  bw = bwl;
	  kb = kbl;
	  kw = kwl;
	  nb = nbl;
	  nw = nwl;
	  pb = pbl;
	  pw = pwl;
	  qb = qbl;
	  qw = qwl;
	  rb = rbl;
	  rw = rwl;
      break;

	default:
	  bb = bbp;
	  bw = bwp;
	  kb = kbp;
	  kw = kwp;
	  nb = nbp;
	  nw = nwp;
	  pb = pbp;
	  pw = pwp;
 	  qb = qbp;
	  qw = qwp;
	  rb = rbp;
	  rw = rwp;
	  break;
}

type ChessPiece = {
	chessPieceType: string;
	chessPieceColor: "white" | "black";
} | null;

type ChessMove = {
	startingSquare: string;
	targetSquare: string;
	chessPieceType: string;
	capturedChessPieceType: string | null;
	promotionChessPieceType: string | null;
	standardAlgebraicNotation: string;
};

type ChessGame = {
	id: string;
	white: string;
	black: string | null;
	bot: { difficulty: "easy" | "medium" | "hard" } | null;
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

const INITIAL_PIECE_COUNTS = {
	pawn: 8,
	knight: 2,
	bishop: 2,
	rook: 2,
	queen: 1,
	king: 1,
};

const CAPTURED_PIECE_ORDER = [
	"queen",
	"rook",
	"bishop",
	"knight",
	"pawn",
] as const;

type ChessPieceType = keyof typeof INITIAL_PIECE_COUNTS;

type ChessPieceData = NonNullable<ChessPiece>;

function getCapturedPieces(
	chessBoard: ChessPiece[][],
	color: "white" | "black",
): ChessPieceData[] {
	const remaining: Record<ChessPieceType, number> = {
		pawn: 0,
		knight: 0,
		bishop: 0,
		rook: 0,
		queen: 0,
		king: 0,
	};

	for (const row of chessBoard) {
		for (const piece of row) {
			if (piece === null) {
				continue;
			}

			const pieceType = piece.chessPieceType as ChessPieceType;

			if (piece.chessPieceColor === color && pieceType in remaining) {
				remaining[pieceType] += 1;
			}
		}
	}

	const captured: ChessPieceData[] = [];

	for (const type of CAPTURED_PIECE_ORDER) {
		const missingCount = INITIAL_PIECE_COUNTS[type] - remaining[type];

		for (let i = 0; i < missingCount; i++) {
			captured.push({ chessPieceType: type, chessPieceColor: color });
		}
	}

	return captured;
}

function CapturedTray({
	pieces,
	label,
}: { pieces: ChessPieceData[]; label: string }) {
	if (pieces.length === 0) {
		return (
			<div className="hidden w-56 shrink-0 lg:block" aria-hidden="true">
				<p className="text-xs /50 text-center py-2">{label}</p>
			</div>
		);
	}

	return (
		<div
			className={`hidden w-56 shrink-0 flex flex-col items-center rounded-2xl p-3 lg:flex`}
			style={{ maxHeight: "calc(100vh - 475px)" }}
		>
			<p className="text-xs font-medium /60 mb-2 uppercase tracking-wider">
				{label}
			</p>
			<div className="grid grid-cols-3 place-items-center gap-1 overflow-auto w-full">
				{pieces.map((piece, index) => (
					<img
						key={`${piece.chessPieceType}-${index}`}
						src={getPieceImage(piece) ?? undefined}
						alt={piece.chessPieceType}
						className="h-15 w-15 object-contain opacity-90 drop-shadow-sm"
					/>
				))}
			</div>
		</div>
	);
}

function Chess() {
	const { theme } = useTheme();
	const [game, setGame] = useState<ChessGame | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [joinGameId, setJoinGameId] = useState("");
	const [botDifficulty, setBotDifficulty] = useState<"easy" | "medium" | "hard">("medium");
	const [botError, setBotError] = useState(false);
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

	const [legalMoves, setLegalMoves] = useState<ChessMove[]>([]);

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
			// Allow recovery if a bot failure happened while this client was offline.
			setBotError(Boolean(gameState?.bot && gameState.chess.currentPlayerColor === "black"));
		}

		function handleLegalMoves(data: {
			startingSquare: string;
			legalMoves: ChessMove[];
		}) {
			setLegalMoves(data.legalMoves);
		}

		function handleGameError(data: { message: string }) {
			console.error(data.message);
			setError(data.message);
			setDraggedPiece(null);
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
			socket.off("connect", refreshGame);
		};
	}, []);

	function createGame() {
		setError(null);
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
		if (!game || game.chess.isGameFinished) {
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
		if (!draggedPiece || !game) {
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
		game && mySideColor
			? getCapturedPieces(game.chess.chessBoard, mySideColor)
			: [];

	const capturedByOpponent =
		game && hisSideColor
			? getCapturedPieces(game.chess.chessBoard, hisSideColor)
			: [];

	const searchingGame =
		game && !game.chess.isGameFinished && game.black === null
			? game
			: null;

	return (
		<div className="min-h-screen flex flex-col">
		<main>
			<Header />

			<section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-6xl">

					<div className="mx-auto mb-6 grid w-[min(660px,100%,calc(100vh-475px))] grid-cols-[1fr_auto_1fr] items-center gap-4">
						<div className={`justify-self-start flex items-center gap-3 rounded-2xl container-theme-${theme} backdrop-blur-lg border border-white/20 px-5 py-3 shadow-lg`}>
							<div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-xl font-bold">
								O
							</div>
							<div>
								<p className="text-lg font-bold">
									{game?.bot ? `Stockfish · ${game.bot.difficulty}` : "Opponent"}
								</p>

								<p className="text-sm /70">
									{game?.bot ? "Computer opponent" : "1200 Elo"}
								</p>
							</div>
						</div>

						<div className="justify-self-center">
							{!game && (
								<div className="flex flex-col items-center">
									<button
										onClick={createGame}
										className="mt-6 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 font-semibold shadow-lg hover:from-violet-400 hover:to-fuchsia-400 transition-all transform hover:scale-105"
									>
										Create a game
									</button>
									<div className="relative mt-3 w-full">
										<select aria-label="Bot difficulty" value={botDifficulty}
											onChange={(event) => setBotDifficulty(event.target.value as "easy" | "medium" | "hard")}
											className={`w-full cursor-pointer appearance-none rounded-xl border border-white/20 container-theme-${theme} backdrop-blur-lg py-3 pl-4 pr-11 text-sm font-semibold text-white shadow-lg outline-none transition duration-200 hover:border-white/40 focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-400/30`}
											style={{ colorScheme: "dark" }}>
											<option className="bg-slate-900 text-white" value="easy">Easy</option>
											<option className="bg-slate-900 text-white" value="medium">Medium</option>
											<option className="bg-slate-900 text-white" value="hard">Hard</option>
										</select>
										<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
											className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70">
											<path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
									<button onClick={createBotGame}
										className="mt-3 rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500">
										Play against bot
									</button>

									<input
										type="text"
										placeholder="Join a game with the ID"
										value={joinGameId}
										onChange={(event) =>
											setJoinGameId(event.target.value)
										}
										onKeyDown={(event) => {
											if (event.key === "Enter") {
												joinGame();
											}
										}}
										className={`mt-3 w-full rounded-xl border border-white/20 container-theme-${theme} backdrop-blur-lg px-4 py-3 outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20`}
									/>
								</div>
							)}

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
							{game && !game?.chess.isGameFinished && game.black === null && (
								<div className={`mt-6 rounded-2xl container-theme-${theme} backdrop-blur-lg border border-white/20 px-6 py-4 shadow-lg`}>
									{game.black === null && (
										<div className="flex flex-col items-center mt-4">
											<p className="mt-2 text-amber-300">
												Waiting for an opponent...
											</p>

											<button
												onClick={cancelGame}
												className="mt-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-6 py-2 font-semibold shadow-lg hover:from-rose-400 hover:to-red-500 transition-all"
											>
												Cancel
											</button>
										</div>

									)}

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

						<div className={`justify-self-end rounded-2xl container-theme-${theme} backdrop-blur-lg border border-white/20 px-6 py-3 font-mono text-xl shadow-lg`}>
							00:00
						</div>
					</div>

					<div className="mx-auto grid w-full grid-cols-[auto_1fr_auto] items-start gap-4">
						{searchingGame ? (
							<div
								className={`hidden w-56 shrink-0 rounded-2xl container-theme-${theme} border border-white/20 p-4 shadow-lg lg:block`}
							>
								<p className="text-sm /70">Game ID :</p>
								<p className="font-mono text-sm mb-2">{searchingGame.id}</p>

								<div className="space-y-1">
									<p className="text-sm">
										<span className="/70">White :</span> {searchingGame.white}
									</p>
									<p className="text-sm">
										<span className="/70">Black :</span>{" "}
										{searchingGame.black ?? "Waiting..."}
									</p>
								</div>
							</div>
						) : (
							<CapturedTray
								pieces={capturedByMe}
								label="Captured by you"
							/>
						)}

						<div className="mx-auto aspect-square w-[min(660px,100%,calc(100vh-475px))]">
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
															className="pointer-events-none h-[88%] w-[88%] object-contain drop-shadow-lg"
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
											className="pointer-events-none fixed z-50 h-24 w-24 object-contain drop-shadow-2xl"
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
										<p className="/80 text-lg">Create or join a game</p>
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

						{searchingGame ? (
							<div className="hidden w-56 shrink-0 lg:block" aria-hidden="true" />
						) : (
							<CapturedTray
								pieces={capturedByOpponent}
								label="Captured by opponent"
							/>
						)}
					</div>

					<div className="mx-auto mt-6 flex w-[min(660px,100%,calc(100vh-475px))] items-center justify-between gap-4">
						<div className={`flex items-center gap-3 rounded-2xl container-theme-${theme} backdrop-blur-lg border border-white/20 px-5 py-3 shadow-lg`}>
							<div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-xl font-bold">
								T
							</div>
							<div>
								<p className="text-lg font-bold">
									You
								</p>

								<p className="text-sm /70">
									1200 Elo
								</p>
							</div>
						</div>

						<div className="mt-8 flex justify-self-start gap-4">
							<button
								className={`rounded-xl container-theme-${theme} backdrop-blur-lg border border-white/20 px-8 py-3 font-semibold transition-all hover:opacity-90 hover:scale-105 shadow-lg`}
								onClick={resignGame}
							>
								Give up
							</button>

							<button className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-8 py-3 font-semibold transition-all hover:from-rose-400 hover:to-red-500 hover:scale-105 shadow-lg">
								Null
							</button>
						</div>
								<div className={`rounded-2xl container-theme-${theme} backdrop-blur-lg border border-white/20 px-6 py-3 font-mono text-xl shadow-lg`}>
							00:00
						</div>
					</div>
				</div>
			</section>
		</main>
		<Footer />
		</div>
	);
}

export default Chess;
