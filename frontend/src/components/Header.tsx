import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { searchUsers, type UserSearchResult } from "../services/users";

function Header() {
	const [searchName, setSearchName] = useState("");
	const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);

	const searchRef = useRef<HTMLDivElement>(null);

	const { isLoggedIn, username, logout } = useAuth();
	const navigate = useNavigate();

	function handleLogout() {
		logout();
		navigate("/");
	}

	useEffect(() => {
		if (searchName.trim().length < 2) {
			setSuggestions([]);
			return;
		}

		const timeoutId = setTimeout(async () => {
			try {
				const result = await searchUsers(searchName.trim());

				if (result.ok)
					setSuggestions(result.users);
				else
					setSuggestions([]);
			} catch (error) {
				console.error("User search failed:", error);
				setSuggestions([]);
			}
		}, 300);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [searchName]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setSuggestions([]);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	function handleSelectUser(username: string) {
		setSearchName("");
		setSuggestions([]);
		navigate(`/profile/${username}`);
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

					{isLoggedIn ? (
						<>
							{/* Search */}

							<div
								ref={searchRef}
								className="relative"
							>

								<form
									onSubmit={(event) => {
										event.preventDefault();

										if (!searchName.trim())
											return;

										navigate(`/profile/${searchName.trim()}`);

										setSearchName("");
										setSuggestions([]);
									}}
								>
									<input
										type="text"
										placeholder="Rechercher un joueur..."
										value={searchName}
										onChange={(event) => {
											setSearchName(event.target.value);
										}}
										className="w-64 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 outline-none focus:border-blue-500"
									/>
								</form>

								{/* Suggestions */}

								{suggestions.length > 0 && (
									<div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">

										{suggestions.map((user) => (
											<button
												key={user.username}
												type="button"
												onClick={() =>
													handleSelectUser(user.username)
												}
												className="block w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-blue-400 transition"
											>
												{user.username}
											</button>
										))}

									</div>
								)}

							</div>

							{/* My profile */}

							<Link
								to={`/profile/${username}`}
								className="text-slate-300 hover:text-blue-400 transition"
							>
								{username}
							</Link>

							{/* Logout */}

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