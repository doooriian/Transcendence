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
    ["", "", "", "", "", "", "", ""],
    [pw, pw, pw, pw, pw, pw, pw, pw],
    [rw, nw, bw, qw, kw, bw, nw, rw],
];

function Chess() {
	const [board, setBoard] = useState(initialBoard);

	const [selectedSquare, setSelectedSquare] = useState<{
		row: number;
		col: number;
	} | null>(null);

	const handleSquareClick = (row: number, col: number) => {
		if (selectedSquare === null) {
			if (board[row][col] !== "") {
				setSelectedSquare({ row, col });
			}

			return;
		}

		const newBoard = board.map((currentRow) => [...currentRow]);

		newBoard[row][col] = newBoard[selectedSquare.row][selectedSquare.col];
		newBoard[selectedSquare.row][selectedSquare.col] = "";

		setBoard(newBoard);
		setSelectedSquare(null);
	};

	return (
		<main className="min-h-screen bg-slate-950 text-white">

			<Header />

			<section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-8">

				<div className="w-full max-w-6xl">

					{/* Player 1 */}

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

					{/* Chess board */}

					<div className="mx-auto w-full max-w-[640px]">

						<div className="grid grid-cols-8 grid-rows-8 aspect-square w-full border-4 border-slate-800">
							{board.map((row, rowIndex) =>
								row.map((piece, columnIndex) => {

									const isDark =
										(rowIndex + columnIndex) % 2 === 1;
									
									const isSelected =
										selectedSquare?.row === rowIndex &&
										selectedSquare?.col === columnIndex;

									return (
										<div
											key={`${rowIndex}-${columnIndex}`}
											onClick={() => handleSquareClick(rowIndex, columnIndex)}
											className={`aspect-square flex items-center justify-center select-none ${
												isSelected
													? "bg-yellow-400"
													: isDark
														? "bg-blue-700"
														: "bg-slate-200"
											}`}
										>
											{piece && (
												<img
													src={piece}
													alt=""
													className="w-[85%] h-[85%] object-contain select-none"
													draggable={false}
												/>
											)}
										</div>
									);
								})
							)}
						</div>

					</div>

					{/* Player 2 */}

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

					{/* Game controls */}

					<div className="mt-6 flex justify-center gap-4">

						<button
							className="rounded-lg bg-slate-800 border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-700 transition"
						>
							Resign
						</button>

						<button
							className="rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700 transition"
						>
							Draw
						</button>

					</div>

				</div>

			</section>

		</main>
	);
}

export default Chess;