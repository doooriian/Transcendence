import { useState } from "react";

function Login() {

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	function handleLogin() {
		console.log(username);
		console.log(password);
	}

	return (
		<div>

			<h1>Login</h1>

			<input
				placeholder="Username"
				value={username}
				onChange={(event) => {
					setUsername(event.target.value);
				}}
			/>

			<input
				placeholder="Password"
				type="password"
				value={password}
				onChange={(event) => {
					setPassword(event.target.value);
				}}
			/>

			<button onClick={handleLogin}>
				Login
			</button>

		</div>
	);
}

export default Login;