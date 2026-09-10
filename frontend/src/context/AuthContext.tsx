import {
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

import { useNavigate } from "react-router-dom";

import socket from "../services/socket";

type AuthContextType = {
	isLoggedIn: boolean;
	username: string | null;
	login: (username: string, token: string) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();

	const [isLoggedIn, setIsLoggedIn] = useState(
		localStorage.getItem("token") !== null,
	);

	const [username, setUsername] = useState(
		localStorage.getItem("username"),
	);

	const [sessionExpired, setSessionExpired] = useState(false);

	function login(username: string, token: string) {
		localStorage.setItem("token", token);
		localStorage.setItem("username", username);

		setIsLoggedIn(true);
		setUsername(username);
		setSessionExpired(false);

		socket.auth = { token };
		socket.connect();
	}

	function logout() {
		socket.disconnect();
		socket.auth = {};

		localStorage.removeItem("token");
		localStorage.removeItem("username");

		setIsLoggedIn(false);
		setUsername(null);
		setSessionExpired(false);

		navigate("/");
	}

	useEffect(() => {
		function handleUnauthorized() {}
			// Évite d'afficher plusieurs popups
			setSessionExpired(true);

			// On déconnecte déjà le socket
			socket.disconnect();
			socket.auth = {};

			// On supprime les informations de session
			localStorage.removeItem("token");
			localStorage.removeItem("username");

			setIsLoggedIn(false);
			setUsername(null);
		}

		window.addEventListener("unauthorized", handleUnauthorized);

		return () => {
			window.removeEventListener(
				"unauthorized",
				handleUnauthorized,
			);
		};
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token)
			return;

		socket.auth = { token };

		if (!socket.connected)
			socket.connect();
	}, []);

	function handleSessionExpired() {
		setSessionExpired(false);
		navigate("/login");
	}

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn,
				username,
				login,
				logout,
			}}
		>
			{children}

			{sessionExpired && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
					<div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl">
						<div className="mb-4 text-5xl">
							⏱️
						</div>

						<h2 className="mb-3 text-2xl font-bold text-white">
							Session expirée
						</h2>

						<p className="mb-6 text-slate-400">
							Votre session a expiré.
							<br />
							Veuillez vous reconnecter pour continuer.
						</p>

						<button
							onClick={handleSessionExpired}
							className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
						>
							Se reconnecter
						</button>
					</div>
				</div>
			)}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error(
			"useAuth must be used inside AuthProvider",
		);
	}

	return context;
}

export default AuthContext;