import { Link } from "react-router-dom";

function Home() {
	return (
		<main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
			<section className="text-center">

				<h1 className="text-6xl font-bold">
					♟ ft_transcendence
				</h1>

				<p className="mt-4 text-xl text-slate-300">
					Play Chess Online
				</p>

				<p className="mt-2 text-slate-400">
					Affrontez vos amis en ligne en temps réel.
				</p>

				<div className="mt-10 flex justify-center gap-6">

					<Link
						to="/login"
						className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
					>
						Login
					</Link>

					<Link
						to="/register"
						className="rounded-lg bg-slate-700 px-6 py-3 font-semibold hover:bg-slate-600"
					>
						Register
					</Link>

				</div>

			</section>
		</main>
	);
}

export default Home;