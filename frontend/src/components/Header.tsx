import { Link, useNavigate } from "react-router-dom";

function Header() {
	const navigate = useNavigate();

	const token = localStorage.getItem("token");
	const username = localStorage.getItem("username");

	function handleLogout() {
		localStorage.removeItem("token");
		localStorage.removeItem("username");

		navigate("/");
	}

	return (
		<header className="bg-slate-900 border-b border-slate-800 text-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between p-4">

				<Link
					to="/"
					className="text-2xl font-bold text-white hover:text-blue-400 transition"
				>
					♟ ft_transcendence
				</Link>


				<nav className="flex items-center gap-6">

					<Link
						to="/"
						className="text-slate-300 hover:text-blue-400 transition"
					>
						Home
					</Link>


					{token ? (
						<>
							<Link
								to={`/profile/${username}`}
								className="text-slate-300 hover:text-blue-400 transition"
							>
								Profile
							</Link>

							<button
								onClick={handleLogout}
								className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								className="text-slate-300 hover:text-blue-400 transition"
							>
								Login
							</Link>

							<Link
								to="/register"
								className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition"
							>
								Register
							</Link>
						</>
					)}

				</nav>

			</div>
		</header>
	);
}

export default Header;