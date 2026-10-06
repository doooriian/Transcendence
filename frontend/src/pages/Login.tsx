import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginResponse } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	const location = useLocation();
	const message = location.state?.message;

	async function handleLogin() {
		setError("");
		const result = await loginResponse(email, password);

		if (!result.ok) {
			setError(result.data.message);
			return;
		}

		login(result.data.username, result.data.token);
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
						Connectez-vous pour jouer aux échecs en ligne
					</p>
				</div>
				{message && (
					<div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
						🔒 {message}
					</div>
				)}

				<form
						onSubmit={(event) => {
							event.preventDefault();
							handleLogin();
						}}
						className="space-y-5"
					>
				<div className="space-y-5">

					<div>
						<label className="block text-sm text-slate-300 mb-2">
							Email
						</label>

						<input
							type="email"
							required
							maxLength={254}
							placeholder="Votre email"
							value={email}
							onChange={(event) => { setEmail(event.target.value); }}
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
										required
										minLength={8}
										maxLength={128}
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
							Login
						</button>


						{error && (
							<p className="rounded-lg bg-red-900/50 border border-red-700 p-3 text-center text-red-300">
								{error}
							</p>
						)}

					<div className="border-t border-slate-800 pt-5 text-center">

							<p className="text-slate-400 mb-3">
								No account ?
							</p>

							<button
							type="button"
								onClick={() => navigate("/register")}
								className="w-full rounded-lg bg-slate-700 py-3 font-semibold hover:bg-slate-600 transition"
							>
								Register
							</button>

						</div>

					</div>
				</form>
			</section>

		</main>
		</>
	);
}

export default Login;
