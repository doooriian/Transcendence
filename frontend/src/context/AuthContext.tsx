import { createContext, useContext, useState } from "react";

type AuthContextType = {
	isLoggedIn: boolean;
	username: string | null;
	login: (username: string, token: string) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isLoggedIn, setIsLoggedIn] = useState(
		localStorage.getItem("token") !== null
	);

	const [username, setUsername] = useState(
		localStorage.getItem("username")
	);

	function login(username: string, token: string) {
		localStorage.setItem("token", token);
		localStorage.setItem("username", username);

		setIsLoggedIn(true);
		setUsername(username);
	}

	function logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("username");

		setIsLoggedIn(false);
		setUsername(null);
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
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
}

export default AuthContext;