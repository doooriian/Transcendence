import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	async function handleRegister() {
		setError("");
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/auth/register`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
				}),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			setError(data.message);
			console.log(data.message);
			return;
		}

		localStorage.setItem("token", data.token);
		
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