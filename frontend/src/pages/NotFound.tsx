import { Link } from "react-router-dom";
import Header from "../components/Header";

function NotFound() {
	return (
        <>
        <Header/>
		<main className="min-h-screen flex items-center justify-center">

			<section className="text-center">

				<p className="text-8xl font-bold text-blue-500">
					404
				</p>

				<h1 className="mt-6 text-4xl font-bold">
					Page not found
				</h1>

				<p className="mt-4 text-xl">
					This page doesn't exist.
				</p>

				<Link
					to="/"
					className="inline-block mt-8 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 transition"
				>
					Back to home
				</Link>

			</section>

		</main>
        </>
	);
}

export default NotFound;