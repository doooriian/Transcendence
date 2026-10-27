import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

type BackendHealth = {
	status: string;
};

function Home() {
	const [backendStatus, setBackendStatus] = useState("loading");
	const { isLoggedIn, username } = useAuth();
	const theme = "blue";

	useEffect(() => {
		async function checkBackendHealth() {
			try {
				const response = await fetch("/health");

				if (!response.ok) {
					throw new Error("Backend response was not ok");
				}

				const data: BackendHealth = await response.json();

				setBackendStatus(data.status);
			} catch (error) {
				console.error("Failed to reach backend:", error);
				setBackendStatus("unreachable");
			}
		}

		checkBackendHealth();

		const intervalId = setInterval(checkBackendHealth, 2000);

		return () => {
			clearInterval(intervalId);
		};
	}, []);

	return (
		<main className="min-h-screen">

			<Header />

			<section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6">

				<div className="w-full max-w-5xl text-center">

					{/* Hero */}

					<div className="mb-12">

						<p className={`font-semibold tracking-widest uppercase text-accent-${theme}`}>
							Online Chess
						</p>

						<h1 className="mt-4 text-6xl md:text-7xl font-bold">
							<span className="">♟ Play Chess.</span>
							<br />
							<span className={`text-accent-${theme}`}>
								Challenge Everyone.
							</span>
						</h1>

						<p className="mx-auto mt-6 max-w-2xl text-2xl font-bold">
							Challenge your friends
							and master the board
						</p>

						{/* User state */}

						{isLoggedIn ? (
							<div className="mt-10">

								<p className="text-xl">
									Welcome back,{" "}
									<span className={`text-accent-${theme} font-bold`}>
										{username}
									</span>
								</p>

								<div className="mt-6 flex justify-center gap-4">

									<Link
										to="/chess"
										className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold hover:bg-blue-700 transition"
									>
										♟ Play Now
									</Link>

									<Link
										to={`/profile/${username}`}
										className="rounded-lg bg-slate-800 border border-slate-700 px-8 py-4 text-lg font-semibold hover:bg-slate-700 transition"
									>
										View Profile
									</Link>

								</div>

							</div>
						) : (
							<div className="mt-10 flex justify-center gap-4">

								<Link
									to="/login"
									className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold hover:bg-blue-700 transition"
								>
									Login
								</Link>

								<Link
									to="/register"
									className="rounded-lg bg-slate-800 border border-slate-700 px-8 py-4 text-lg font-semibold hover:bg-slate-700 transition"
								>
									Register
								</Link>

							</div>
						)}

					</div>

					{/* Information cards */}

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

						<div className={`rounded-xl container-theme-${theme} border border-slate-800 p-6`}>

							<div className="text-3xl">
								♟
							</div>

							<h2 className="mt-4 text-xl font-bold">
								Play
							</h2>

							<p className="mt-2">
								Play chess against
								other players
							</p>

						</div>

						<div className={`rounded-xl container-theme-${theme} border border-slate-800 p-6`}>

							<div className="text-3xl">
								🎖
							</div>

							<h2 className="mt-4 text-xl font-bold">
								Compete
							</h2>

							<p className="mt-2">
								Climb the rankings and improve
								your Elo
							</p>

						</div>

						<div className={`rounded-xl container-theme-${theme} border border-slate-800 p-6`}>

							<div className="text-3xl">
								⏱
							</div>

							<h2 className="mt-4 text-xl font-bold">
								Real-time
							</h2>

							<p className="mt-2">
								Face your opponents in real time
							</p>

						</div>

					</div>

					{/* Backend status */}

					<div className="mt-8 text-sm text-slate-500">

						<span>Backend: </span>

						<span
							className={
								backendStatus === "ok"
									? "text-green-400"
									: "text-red-400"
							}
						>
							{backendStatus}
						</span>

					</div>

				</div>

			</section>
			<Footer/>
		</main>
	);
}

export default Home;