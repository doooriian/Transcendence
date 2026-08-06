import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

function Register() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	async function handleRegister() {
		setError("");
		const result = await register(username, password);

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
			<h1>Register</h1>

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

			<button onClick={handleRegister}>
				Register
			</button>
			
			{error && <p>{error}</p>}
		
			<section>
				<button onClick={() => {navigate("/login")}}>
					Login
				</button>
			</section>
		</main>
	);
}

export default Register;