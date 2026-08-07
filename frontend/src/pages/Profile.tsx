import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMyProfile, getUser, type User } from "../services/users";
import Header from "../components/Header";

function Profile() {
	const { username } = useParams();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		async function loadUser() {
			if (!username)
				return;

			const myUsername = localStorage.getItem("username");

			let result;

			if (username !== myUsername)
				result = await getUser(username);
			else
				result = await getMyProfile();

			if (result.ok) {
				setUser(result.data);
			}
		}

		loadUser();
	}, [username]);

	if (!user) {
		return (
			<main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
				<p className="text-xl text-slate-400">
					Loading profile...
				</p>
			</main>
		);
	}

	return (
		<>
		<Header/>
		<main className="min-h-screen bg-slate-950 flex items-center justify-center text-white">

			<section className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl">

				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold">
						♟ Profile
					</h1>

					<p className="mt-3 text-slate-400">
						Player information
					</p>
				</div>


				<div className="space-y-4">

					<div className="rounded-lg bg-slate-800 p-4">
						<p className="text-sm text-slate-400">
							ID
						</p>

						<p className="text-xl font-semibold">
							{user.id}
						</p>
					</div>


					<div className="rounded-lg bg-slate-800 p-4">
						<p className="text-sm text-slate-400">
							Username
						</p>

						<p className="text-xl font-semibold">
							{user.username}
						</p>
					</div>


					<div className="rounded-lg bg-slate-800 p-4">
						<p className="text-sm text-slate-400">
							Created at
						</p>

						<p className="text-sm">
							{user.createdAt}
						</p>
					</div>


					<div className="rounded-lg bg-slate-800 p-4">
						<p className="text-sm text-slate-400">
							Last update
						</p>

						<p className="text-sm">
							{user.updatedAt}
						</p>
					</div>

				</div>

			</section>

		</main>
		</>
	);
}

export default Profile;