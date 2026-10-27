import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginResponse } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const { login } = useAuth();
	const theme = "blue";
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
		<div className="min-h-screen flex flex-col">
		<Header/>

		<main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-10 pb-16">

			<section className={`w-full max-w-md rounded-2xl container-theme-${theme} border border-slate-800 p-8 shadow-xl`}>

				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold">
						♟ ft_chess
					</h1>

					<p className="mt-3">
						Log in to play chess online
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
							placeholder="Your email"
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
										placeholder="Your password"
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

							<p className="mb-3">
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
		<Footer />
		</div>
	);
}

export default Login;