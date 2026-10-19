import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { searchUsers, type UserSearchResult } from "../services/users";

function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	
	const [searchName, setSearchName] = useState("");
	const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);

	const searchRef = useRef<HTMLDivElement>(null);
	const [selectedIndex, setSelectedIndex] = useState(-1);

	const { isLoggedIn, username, logout } = useAuth();
	const { theme } = useTheme();
	const navigate = useNavigate();

	function handleLogout() {
		logout();
		navigate("/");
	}

	useEffect(() => {
		if (searchName.trim().length < 2) {
			return;
		}

		const timeoutId = setTimeout(async () => {
			try {
				const result = await searchUsers(searchName.trim());

				if (result.ok) {
					setSuggestions(result.users);
					setSelectedIndex(-1);
				} else {
					setSuggestions([]);
					setSelectedIndex(-1);
				}
			} catch (error) {
				console.error("User search failed:", error);
				setSuggestions([]);
				setSelectedIndex(-1);
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
		<header className={`container-theme-${theme} border-b border-slate-800 text-white`}>
			<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 p-4">

				<Link
					to="/"
					className="text-xl sm:text-2xl font-bold text-white hover:text-blue-400 transition"
					onClick={() => setMenuOpen(false)}
				>
					♟ ft_chess
				</Link>

				{/* Bouton visible uniquement sur téléphone */}
				<button
					type="button"
					onClick={() => setMenuOpen((open) => !open)}
					className="rounded-lg border border-slate-700 px-3 py-2 text-xl hover:bg-slate-800 md:hidden"
					aria-label={menuOpen ? "Close menu" : "Open menu"}
					aria-expanded={menuOpen}
				>
					{menuOpen ? "✕" : "☰"}
				</button>

				<nav
					className={`${
						menuOpen ? "flex" : "hidden"
					} w-full flex-col items-stretch gap-4 md:flex md:w-auto md:flex-row md:items-center md:gap-6`}
				>
					{isLoggedIn ? (
						<>
							<div ref={searchRef} className="relative w-full md:w-auto">
								<form
									onSubmit={(event) => {
										event.preventDefault();

										if (selectedIndex >= 0 && suggestions[selectedIndex]) {
											handleSelectUser(suggestions[selectedIndex].username);
											setMenuOpen(false);
											return;
										}

										if (!searchName.trim())
											return;

										navigate(`/profile/${encodeURIComponent(searchName.trim())}`);
										setSearchName("");
										setSuggestions([]);
										setMenuOpen(false);
									}}
								>
									<input
										type="text"
										placeholder="Find a player..."
										value={searchName}
										onChange={(event) => {
											const value = event.target.value;
											setSearchName(value);

											if (value.trim().length < 2) {
												setSuggestions([]);
												setSelectedIndex(-1);
											}
										}}
										onKeyDown={(event) => {
											if (event.key === "ArrowDown") {
												event.preventDefault();

												if (suggestions.length === 0)
													return;

												setSelectedIndex((current) =>
													current < suggestions.length - 1
														? current + 1
														: 0
												);
											}

											if (event.key === "ArrowUp") {
												event.preventDefault();

												if (suggestions.length === 0)
													return;

												setSelectedIndex((current) =>
													current > 0
														? current - 1
														: suggestions.length - 1
												);
											}

											if (event.key === "Escape") {
												setSuggestions([]);
												setSelectedIndex(-1);
											}
										}}
										className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 md:w-64"
									/>
								</form>

								{suggestions.length > 0 && (
									<div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
										{suggestions.map((user, index) => (
											<button
												key={user.username}
												type="button"
												onClick={() => {
													handleSelectUser(user.username);
													setMenuOpen(false);
												}}
												className={`block w-full px-4 py-3 text-left transition ${
													index === selectedIndex
														? "bg-blue-600 text-white"
														: "text-slate-300 hover:bg-slate-800 hover:text-blue-400"
												}`}
											>
												{user.username}
											</button>
										))}
									</div>
								)}
							</div>

							<Link
								to="/friends"
								onClick={() => setMenuOpen(false)}
								className="rounded-lg py-2 text-slate-300 hover:text-blue-400 transition"
							>
								Friends
							</Link>

							<Link
								to={`/profile/${encodeURIComponent(username ?? "")}`}
								onClick={() => setMenuOpen(false)}
								className="rounded-lg py-2 text-slate-300 hover:text-blue-400 transition"
							>
								{username}
							</Link>

							<button
								onClick={() => {
									handleLogout();
									setMenuOpen(false);
								}}
								className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 transition"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								onClick={() => setMenuOpen(false)}
								className="py-2 hover:text-blue-400 transition"
							>
								Login
							</Link>

							<Link
								to="/register"
								onClick={() => setMenuOpen(false)}
								className="rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700 transition"
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
