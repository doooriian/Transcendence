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

function login(username: string, token: string) {
	localStorage.setItem("token", token);
	localStorage.setItem("username", username);

	setIsLoggedIn(true);
	setUsername(username);

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

	navigate("/");
}

// Écoute une réponse 401 venant de apiFetch
useEffect(() => {
	function handleUnauthorized() {
		logout();
	}

	window.addEventListener("unauthorized", handleUnauthorized);

	return () => {
		window.removeEventListener(
			"unauthorized",
			handleUnauthorized,
		);
	};
}, []);

// Connexion du socket si un token existe
useEffect(() => {
	const token = localStorage.getItem("token");

	if (!token)
		return;

	socket.auth = { token };

	if (!socket.connected)
		socket.connect();
}, []);

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
