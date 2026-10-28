import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

function Register() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const { login } = useAuth();
	const { theme } = useTheme();
	const navigate = useNavigate();

	async function handleRegister() {
		setError("");

		const result = await register(username, email, password);

		if (!result.ok) {
			setError(result.data.message);
			return;
		}

		login(result.data.authId, result.data.username, result.data.token);
		navigate("/");
	}

	return (
			<div className="min-h-screen flex flex-col">
			<Header />

			<main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8 sm:py-10">

				<section className={`w-full max-w-md min-w-0 rounded-2xl container-theme-${theme} border border-slate-800 p-5 shadow-xl sm:p-8`}>

					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold sm:text-4xl">
							♟ ft_chess
						</h1>

						<p className="mt-3">
							Create your account and join the game
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
								required
								minLength={3}
								maxLength={20}
								pattern="[A-Za-z0-9_]+"
								placeholder="Your username"
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
								required
								maxLength={254}
								placeholder="Your email"
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
							Register
						</button>

						{error && (
							<p className="rounded-lg bg-red-900/50 border border-red-700 p-3 text-center text-red-300">
								{error}
							</p>
						)}

						<div className="border-t border-slate-800 pt-5 text-center">

							<p className="mb-3">
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
			<Footer />
			</div>
	);
}

export default Register;
