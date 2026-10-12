import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useParams } from "react-router-dom";
import { getMyProfile, getUser, type User } from "../services/users";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

import {
	getFriends,
	getFriendRequests,
	sendFriendRequest,
	acceptFriendRequest,
	deleteFriendRequest,
	type Friend,
	type FriendRequest,
} from "../services/friends";

function Profile() {
	const { username } = useParams();
	const { username: myUsername } = useAuth();
	const { theme } = useTheme();

	const [user, setUser] = useState<User | null>(null);

	const [friends, setFriends] = useState<Friend[]>([]);
	const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
	const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

	const [error, setError] = useState("");
	const [loadingFriendAction, setLoadingFriendAction] = useState(false);

	useEffect(() => {
		async function loadUser() {
			if (!username)
				return;

			let result;

			if (username !== myUsername)
				result = await getUser(username);
			else
				result = await getMyProfile();

			if (result.ok)
				setUser(result.data);
			else
				setUser(null);
		}

		loadUser();
	}, [username, myUsername]);


	useEffect(() => {
		async function loadFriendData() {
			if (!username || username === myUsername)
				return;

			try {
				const friendsResult = await getFriends();
				const requestsResult = await getFriendRequests();

				if (friendsResult.ok) {
					setFriends(friendsResult.friends);
				}

				if (requestsResult.ok) {
					setReceivedRequests(requestsResult.received);
					setSentRequests(requestsResult.sent);
				}
			} catch (error) {
				console.error(error);
			}
		}

		loadFriendData();

		const intervalId = setInterval(loadFriendData, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [username, myUsername]);


	async function handleAddFriend() {
		if (!username)
			return;

		setLoadingFriendAction(true);
		setError("");

		const result = await sendFriendRequest(username);

		if (!result.ok) {
			setError(result.data.message);
			setLoadingFriendAction(false);
			return;
		}

		const requestsResult = await getFriendRequests();

		if (requestsResult.ok) {
			setReceivedRequests(requestsResult.received);
			setSentRequests(requestsResult.sent);
		}

		setLoadingFriendAction(false);
	}


	async function handleAccept(id: number) {
		setLoadingFriendAction(true);
		setError("");

		const result = await acceptFriendRequest(id);

		if (!result.ok) {
			setError(result.data.message);
			setLoadingFriendAction(false);
			return;
		}

		const friendsResult = await getFriends();
		const requestsResult = await getFriendRequests();

		if (friendsResult.ok)
			setFriends(friendsResult.friends);

		if (requestsResult.ok) {
			setReceivedRequests(requestsResult.received);
			setSentRequests(requestsResult.sent);
		}

		setLoadingFriendAction(false);
	}


	async function handleReject(id: number) {
		setLoadingFriendAction(true);
		setError("");

		const result = await deleteFriendRequest(id);

		if (!result.ok) {
			setError(result.data.message);
			setLoadingFriendAction(false);
			return;
		}

		setReceivedRequests((current) =>
			current.filter((request) => request.id !== id)
		);

		setLoadingFriendAction(false);
	}


if (!user) {
    return (
        <div className="min-h-screen">
            <Header />

            <main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
                <p className="text-xl">
                    Profile not found
                </p>
            </main>

            <Footer />
        </div>
    );
}

	const isMyProfile = username === myUsername;

	const isFriend = friends.some(
		(friend) => friend.username === user.username
	);
	const sentRequest = sentRequests.find(
		(request) => request.username === user.username
	);
	const receivedRequest = receivedRequests.find(
		(request) => request.username === user.username
	);


	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">

				<section className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl">

					<div className="text-center mb-8">

						<div className="flex justify-center mb-4">
							{user.avatar ? (
								<img
									src={user.avatar}
									alt={`${user.username}'s avatar`}
									className="w-24 h-24 rounded-full object-cover"
								/>
							) : (
								<div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl">
									♟
								</div>
							)}
						</div>

						<h1 className={`text-4xl font-bold `}>
							♟ Profile
						</h1>

						<p className="mt-3 text-slate-400">
							Player information
						</p>

					</div>


					<div className="space-y-4">

						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">
								ID
							</p>

							<p className="text-xl font-semibold">
								{user.id}
							</p>
						</div>


						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">
								Username
							</p>

							<p className="text-xl font-semibold">
								{user.username}
							</p>
						</div>


						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">
								Mail
							</p>

							<p className="text-xl font-semibold">
								{user.email}
							</p>
						</div>


						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">
								Created at
							</p>

							<p className="text-sm">
								{user.createdAt}
							</p>
						</div>


						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">
								Last update
							</p>

							<p className="text-sm">
								{user.updatedAt}
							</p>
						</div>

						{!isMyProfile && (
							<div className="pt-4">

								{isFriend ? (

									<div className="rounded-lg bg-green-900/40 border border-green-700 p-3 text-center text-green-300">
										✓ Friends
									</div>

								) : receivedRequest ? (

									<div className="space-y-3">

										<p className="text-center text-slate-400">
											{user.username} sent you a friend request
										</p>

										<div className="flex gap-3">

											<button
												onClick={() => handleAccept(receivedRequest.id)}
												disabled={loadingFriendAction}
												className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
											>
												Accept
											</button>

											<button
												onClick={() => handleReject(receivedRequest.id)}
												disabled={loadingFriendAction}
												className="flex-1 rounded-lg bg-slate-700 px-4 py-3 font-semibold hover:bg-slate-600 transition disabled:opacity-50"
											>
												Reject
											</button>

										</div>

									</div>

								) : sentRequest ? (

									<div className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-center text-slate-300">
										Request sent
									</div>

								) : (

									<button
										onClick={handleAddFriend}
										disabled={loadingFriendAction}
										className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-50"
									>
										{loadingFriendAction
											? "Sending..."
											: "+ Add Friend"}
									</button>

								)}

							</div>
						)}

						{error && (
							<p className="rounded-lg bg-red-900/40 border border-red-700 p-3 text-center text-red-300">
								{error}
							</p>
						)}
					</div>
				</section>

			</main>
			<Footer />
			</div>
	);
}

export default Profile;
