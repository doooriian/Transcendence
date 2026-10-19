import { Link } from "react-router-dom";

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
					<Link
						to="/"
						className="text-slate-400 transition hover:text-white"
					>
						Home
					</Link>

					<Link
						to="/privacy-policy"
						onClick={() => {
							window.scrollTo({ top: 0, behavior: "smooth" });
						}}
						className="text-slate-400 transition hover:text-white"
					>
						Privacy Policy
					</Link>

					<Link
						to="/terms-of-service"
						onClick={() => {
							window.scrollTo({ top: 0, behavior: "smooth" });
						}}
						className="text-slate-400 transition hover:text-white"
					>
						Terms of Service
					</Link>

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