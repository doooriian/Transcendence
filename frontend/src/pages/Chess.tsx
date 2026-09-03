import { useState } from "react";
import Header from "../components/Header";

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

const initialBoard = [
	[rb, nb, bb, qb, kb, bb, nb, rb],
	[pb, pb, pb, pb, pb, pb, pb, pb],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""]	,
	[pw, pw, pw, pw, pw, pw, pw, pw],
	[rw, nw, bw, qw, kw, bw, nw, rw],
];

function Chess() {
	const [board, setBoard] = useState(initialBoard);

	// La pièce actuellement déplacée
	const [draggedPiece, setDraggedPiece] = useState<{
		row: number;
		col: number;
		piece: string;
	} | null>(null);

	// Position actuelle de la souris
	const [mousePosition, setMousePosition] = useState({
		x: 0,
		y: 0,
	});

	// Quand on appuie sur une pièce
	const handleMouseDown = (
		event: React.MouseEvent,
		row: number,
		col: number
	) => {
		const piece = board[row][col];

		// S'il n'y a pas de pièce, on ne fait rien
		if (piece === "") {
			return;
		}

		// On empêche le navigateur de faire son drag & drop par défaut
		event.preventDefault();

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

	// Quand la souris bouge
	const handleMouseMove = (event: React.MouseEvent) => {
		if (!draggedPiece) {
			return;
		}

		setMousePosition({
			x: event.clientX,
			y: event.clientY,
		});
	};

	// Quand on relâche la souris
	const handleMouseUp = (event: React.MouseEvent) => {
		if (!draggedPiece) {
			return;
		}

		const boardElement = event.currentTarget as HTMLElement;
		const rect = boardElement.getBoundingClientRect();

		// Position de la souris à l'intérieur du plateau
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Si on relâche en dehors du plateau
		if (
			x < 0 ||
			y < 0 ||
			x > rect.width ||
			y > rect.height
		) {
			setDraggedPiece(null);
			return;
		}

		// Taille d'une case
		const squareWidth = rect.width / 8;
		const squareHeight = rect.height / 8;

		// On trouve la colonne et la ligne correspondantes
		const targetCol = Math.floor(x / squareWidth);
		const targetRow = Math.floor(y / squareHeight);

		// On crée une copie du plateau
		const newBoard = board.map((row) => [...row]);

		// On déplace la pièce
		newBoard[targetRow][targetCol] =
			draggedPiece.piece;

		// On vide l'ancienne case
		if (draggedPiece.row !== targetRow || draggedPiece.col !== targetCol)
			newBoard[draggedPiece.row][draggedPiece.col] = "";

		setBoard(newBoard);

		// On arrête le déplacement
		setDraggedPiece(null);
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

						<div className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2">
							00:00
						</div>
					</div>

					{/* Échiquier */}
					<div className="mx-auto w-full max-w-[640px]">
						<div
							className="grid grid-cols-8 grid-rows-8 aspect-square w-full border-4 border-slate-800"
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
						>
							{board.map((row, rowIndex) =>
								row.map((piece, columnIndex) => {
									const isDark =
										(rowIndex + columnIndex) % 2 === 1;

									const isDragging =
										draggedPiece?.row === rowIndex &&
										draggedPiece?.col === columnIndex;

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
											className={`relative aspect-square flex items-center justify-center select-none cursor-grab ${
												isDragging
													? "opacity-30"
													: ""
											} ${
												isDark
													? "bg-blue-700"
													: "bg-slate-200"
											}`}
										>
											{piece && (
												<img
													src={piece}
													alt=""
													draggable={false}
													className="w-[85%] h-[85%] object-contain pointer-events-none"
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
									className="fixed w-20 h-20 object-contain pointer-events-none z-50"
									style={{
										left: mousePosition.x - 40,
										top: mousePosition.y - 40,
									}}
								/>
							)}
						</div>
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

						<div className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2">
							00:00
						</div>
					</div>

					{/* Contrôles */}
					<div className="mt-6 flex justify-center gap-4">
						<button className="rounded-lg bg-slate-800 border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-700 transition">
							Resign
						</button>

						<button className="rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700 transition">
							Draw
						</button>
					</div>

				</div>
			</section>
		</main>
	);
}

export default Chess;