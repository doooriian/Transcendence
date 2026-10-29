import { Link } from "react-router-dom";
import Header from "../components/Header";

function NotFound() {
	return (
        <>
        <Header/>
		<main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-12">

			<section className="text-center">

				<p className="text-6xl font-bold text-blue-500 sm:text-8xl">
					404
				</p>

				<h1 className="mt-6 text-2xl font-bold sm:text-4xl">
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