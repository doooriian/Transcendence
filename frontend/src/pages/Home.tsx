import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";

type BackendHealth = {
	status: string;
};

function Home() {
	const navigate = useNavigate();

	const [backendStatus, setBackendStatus] = useState("loading");
	const [isLoggedIn, setIsLoggedIn] = useState(
		localStorage.getItem("token") !== null
	);

	const username = localStorage.getItem("username");

	useEffect(() => {
		async function checkBackendHealth() {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/health`
				);

				if (!response.ok) {
					throw new Error("Backend response was not ok");
				}

				const data: BackendHealth = await response.json();
				setBackendStatus(data.status);
			} catch (error) {
				console.error(error);
				setBackendStatus("unreachable");
			}
		}

		checkBackendHealth();

		const intervalId = setInterval(checkBackendHealth, 2000);

		return () => clearInterval(intervalId);
	}, []);

	function handleLogout() {
		localStorage.removeItem("token");
		localStorage.removeItem("username");

		setIsLoggedIn(false);

		navigate("/");
	}

	return (
		<>
		<Header/>
		<main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
			<section className="text-center rounded-xl bg-slate-900 border border-slate-800 p-8">
				<h1 className="text-6xl font-bold">
					♟ ft_transcendence
				</h1>

				<p className="mt-4 text-xl text-slate-300">
					Play Chess Online
				</p>

				<p className="mt-2 text-slate-400">
					Affrontez vos amis en ligne en temps réel.
				</p>

				<div className="mt-6 rounded-lg bg-slate-800 p-4">
					<p className="text-sm text-slate-400">
						Backend status
					</p>

					<p className="mt-1 text-xl font-bold">
						{backendStatus}
					</p>
				</div>

				<div className="mt-10 flex justify-center gap-6">
					{isLoggedIn ? (
						<>
							<Link
								to={`/profile/${username}`}
								className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
							>
								Profile
							</Link>

							<button
								onClick={handleLogout}
								className="rounded-lg bg-slate-700 px-6 py-3 font-semibold hover:bg-slate-600"
							>
								Logout
							</button>
						</>
					) : (
						<>
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
						</>
					)}
				</div>
			</section>
		</main>
		</>
	);
}

export default Home;