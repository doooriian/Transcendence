import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import Header from "../components/Header";

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
		<>
		<Header/>
		<main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">

			<section className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl">

				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold">
						♟ ft_transcendence
					</h1>

					<p className="mt-3 text-slate-400">
						Créez votre compte et rejoignez la partie
					</p>
				</div>


				<div className="space-y-5">

					<div>
						<label className="block text-sm text-slate-300 mb-2">
							Username
						</label>

						<input
							type="text"
							placeholder="Votre pseudo"
							value={username}
							onChange={(event) => {
								setUsername(event.target.value);
							}}
							className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
						/>
					</div>


					<div>
						<label className="block text-sm text-slate-300 mb-2">
							Password
						</label>

						<input
							type="password"
							placeholder="Votre mot de passe"
							value={password}
							onChange={(event) => {
								setPassword(event.target.value);
							}}
							className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
						/>
					</div>


					<button
						onClick={handleRegister}
						className="w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-700 transition"
					>
						Register
					</button>


					{error && (
						<p className="rounded-lg bg-red-900/50 border border-red-700 p-3 text-center text-red-300">
							{error}
						</p>
					)}


					<div className="border-t border-slate-800 pt-5 text-center">

						<p className="text-slate-400 mb-3">
							Already have an account ?
						</p>

						<button
							onClick={() => navigate("/login")}
							className="w-full rounded-lg bg-slate-700 py-3 font-semibold hover:bg-slate-600 transition"
						>	
							Login
						</button>

					</div>

				</div>

			</section>

		</main>
		</>
	);
}

export default Register;