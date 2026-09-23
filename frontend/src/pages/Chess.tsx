import { useState, useEffect } from "react";
import Header from "../components/Header";
import socket from "../services/socket";

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

type ChessPiece = string;

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

function Chess() {
	const [game, setGame] = useState<ChessGame | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [joinGameId, setJoinGameId] = useState("");

	const [draggedPiece, setDraggedPiece] = useState<{
		row: number;
		col: number;
		piece: string;
	} | null>(null);

	const [legalMoves, setLegalMoves] = useState<ChessMove[]>([]);

	const [mousePosition, setMousePosition] = useState({
		x: 0,
		y: 0,
	});

	useEffect(() => {
		function updateGame(gameState: ChessGame) {
			console.log("GAME RECUE :", gameState);
			console.log("BOARD RECUE :", gameState.chess?.chessBoard);

			setGame(gameState);
			setDraggedPiece(null);
			setLegalMoves([]);
		}

		function handleGameActive(gameState: ChessGame | null) {
			setGame(gameState);
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

		socket.on("game:created", updateGame);
		socket.on("game:ready", updateGame);
		socket.on("game:updated", updateGame);
		socket.on("game:ended", updateGame);

		socket.on("game:active", handleGameActive);
		socket.on("game:legal-moves", handleLegalMoves);
		socket.on("game:error", handleGameError);

		socket.emit("game:get-active");

		return () => {
			socket.off("game:created", updateGame);
			socket.off("game:ready", updateGame);
			socket.off("game:updated", updateGame);
			socket.off("game:ended", updateGame);

			socket.off("game:active", handleGameActive);
			socket.off("game:legal-moves", handleLegalMoves);
			socket.off("game:error", handleGameError);
		};
	}, []);

	function createGame() {
		setError(null);
		socket.emit("game:create");
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

	const handleMouseDown = (
		event: React.MouseEvent,
		row: number,
		col: number
	) => {
		if (!game) {
			return;
		}

		const piece = game.chess.chessBoard[row][col];

		if (piece === "") {
			return;
		}

		event.preventDefault();

		const startingSquare = caseBoard[row][col];

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

		const startingSquare =
			caseBoard[draggedPiece.row][draggedPiece.col];

		const targetSquare =
			caseBoard[targetRow][targetCol];

		const moveIsLegal = legalMoves.some(
			(move) => move.targetSquare === targetSquare
		);

		if (!moveIsLegal) {
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

	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<Header />

			<section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-6xl">

					{/* Adversaire */}
					<div className="mb-4 flex items-center justify-between">
						<div>
							<p className="text-lg font-bold">
								Opponent
							</p>

							<p className="text-sm text-slate-400">
								1200 Elo
							</p>
						</div>

						<div>
							{!game && (
								<div className="flex flex-col items-center">
									<button
										onClick={createGame}
										className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
									>
										Créer une partie
									</button>

									<input
										type="text"
										placeholder="Rejoindre une partie"
										value={joinGameId}
										onChange={(event) =>
											setJoinGameId(event.target.value)
										}
										onKeyDown={(event) => {
											if (event.key === "Enter") {
												joinGame();
											}
										}}
										className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
									/>
								</div>
							)}

							{error && (
								<p className="mt-4 text-red-400">
									{error}
								</p>
							)}

							{game && (
								<div className="mt-6">
									<p>
										Partie : {game.id}
									</p>

									<p>
										Blanc : {game.white}
									</p>

									<p>
										Noir : {game.black ?? "En attente..."}
									</p>

									{game.black === null && (
										<p className="mt-4 text-yellow-400">
											En attente d'un adversaire...
										</p>
									)}

									{game.black !== null && (
										<p className="mt-4 text-green-400">
											La partie est prête !
										</p>
									)}
								</div>
							)}
						</div>

						<div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
							00:00
						</div>
					</div>

					{/* Échiquier */}
					<div className="mx-auto w-full max-w-[640px]">
						{game ? (
							<div
								className="grid aspect-square w-full grid-cols-8 grid-rows-8 border-4 border-slate-800"
								onMouseMove={handleMouseMove}
								onMouseUp={handleMouseUp}
							>
								{game.chess.chessBoard.map(
									(row, rowIndex) =>
										row.map((piece, columnIndex) => {
											const isDark =
												(rowIndex + columnIndex) % 2 === 1;

											const square =
												caseBoard[rowIndex][columnIndex];

											const isDragging =
												draggedPiece?.row === rowIndex &&
												draggedPiece?.col === columnIndex;

											const isLegalMove =
												legalMoves.some(
													(move) =>
														move.targetSquare === square
												);

											return (
												<div
													key={`${rowIndex}-${columnIndex}`}
													onMouseDown={(event) =>
														handleMouseDown(
															event,
															rowIndex,
															columnIndex
														)
													}
													className={`relative flex aspect-square select-none items-center justify-center cursor-grab ${
														isDragging
															? "opacity-30"
															: ""
													} ${
														isDark
															? "bg-blue-700"
															: "bg-slate-200"
													} ${
														isLegalMove
															? "ring-4 ring-inset ring-green-400"
															: ""
													}`}
												>
													{piece && (
														<img
															src={piece}
															alt=""
															draggable={false}
															className="pointer-events-none h-[85%] w-[85%] object-contain"
														/>
													)}
												</div>
											);
										})
								)}

								{/* Pièce qui suit la souris */}
								{draggedPiece && (
									<img
										src={draggedPiece.piece}
										alt=""
										draggable={false}
										className="pointer-events-none fixed z-50 h-20 w-20 object-contain"
										style={{
											left: mousePosition.x - 40,
											top: mousePosition.y - 40,
										}}
									/>
								)}
							</div>
						) : (
							<div className="flex aspect-square items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
								<p className="text-slate-400">
									Crée ou rejoins une partie
								</p>
							</div>
						)}
					</div>

					{/* Joueur */}
					<div className="mt-4 flex items-center justify-between">
						<div>
							<p className="text-lg font-bold">
								You
							</p>

							<p className="text-sm text-slate-400">
								1200 Elo
							</p>
						</div>

						<div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
							00:00
						</div>
					</div>

					{/* Contrôles */}
					<div className="mt-6 flex justify-center gap-4">
						<button
							className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-semibold transition hover:bg-slate-700"
							onClick={() => {
								if (game) {
									socket.emit("game:resign", game.id);
								}
							}}
						>
							Resign
						</button>

						<button className="rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700">
							Draw
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}

export default Chess;