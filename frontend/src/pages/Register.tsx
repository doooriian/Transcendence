import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

function Register() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	async function handleRegister() {
		setError("");

		const result = await register(username, email, password);

		if (!result.ok) {
			setError(result.data.message);
			return;
		}

		login(username, result.data.token);
		navigate("/");
	}

	return (
		<>
			<Header />

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

					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleRegister();
						}}
						className="space-y-5"
					>

						<div>
							<label className="block text-sm text-slate-300 mb-2">
								Username
							</label>

							<input
								type="text"
								placeholder="Votre pseudo"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
								className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
							/>
						</div>


						<div>
							<label className="block text-sm text-slate-300 mb-2">
								Email
							</label>

							<input
								type="email"
								placeholder="Votre email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-blue-500"
							/>
						</div>

						<div>
							<label className="block text-sm text-slate-300 mb-2">
								Password
							</label>

							<div className="relative">

								<input
									type={showPassword ? "text" : "password"}
									placeholder="Votre mot de passe"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 pr-12 outline-none focus:border-blue-500"
								/>

								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
								>
									{showPassword ? "Hide" : "Show"}
								</button>

							</div>
						</div>

						<button
							type="submit"
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
								Already have an account?
							</p>

							<button
								type="button"
								onClick={() => navigate("/login")}
								className="w-full rounded-lg bg-slate-700 py-3 font-semibold hover:bg-slate-600 transition"
							>
								Login
							</button>

						</div>

					</form>

				</section>

			</main>
		</>
	);
}

export default Register;
