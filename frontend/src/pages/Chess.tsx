import Header from "../components/Header";

const board = [
	["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
	["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
	["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

function Chess() {
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

						<div className="grid grid-cols-8 aspect-square border-4 border-slate-800">

							{board.map((row, rowIndex) =>
								row.map((piece, columnIndex) => {

									const isDark =
										(rowIndex + columnIndex) % 2 === 1;

									return (
										<div
											key={`${rowIndex}-${columnIndex}`}
											className={`flex items-center justify-center text-4xl sm:text-5xl md:text-6xl select-none ${
												isDark
													? "bg-blue-700"
													: "bg-slate-200"
											}`}
										>
											<span
												className={
													"drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
												}
											>
												{piece}
											</span>
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