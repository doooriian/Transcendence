import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	async function handleLogin() {
		setError("");
		const result = await login(username, password);

		if (!result.ok) {
			setError(result.data.message);
			return;
		}

		localStorage.setItem("token", result.data.token);
		localStorage.setItem("username", username);
		navigate("/");
	}

	return (
		<main>
			<h1>Login</h1>

			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={(event) => {
					setUsername(event.target.value);
				}}
			/>

			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(event) => {
					setPassword(event.target.value);
				}}
			/>

			<button onClick={handleLogin}>
				Login
			</button>

			{error && 
				<p>{error}</p>
			}
		</main>
	);
}

export default Login;