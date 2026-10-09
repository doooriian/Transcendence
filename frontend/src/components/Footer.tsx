function Footer() {
	return (
		<footer className="border-t border-slate-800 bg-slate-950">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
				
				<div className="text-sm text-slate-400">
					<span className="font-bold text-white">
						♟ ft_chess
					</span>
					{" "}— © 2026
				</div>

				<div className="flex gap-6 text-sm">
					<a
						href="#"
						className="text-slate-400 transition hover:text-white"
					>
						Home
					</a>

					<a
						href="#"
						className="text-slate-400 transition hover:text-white"
					>
						About
					</a>

					<a
						href="https://github.com/doooriian/Transcendence"
						className="text-slate-400 transition hover:text-white"
					>
						GitHub
					</a>
				</div>

			</div>
		</footer>
	);
}

export default Footer;