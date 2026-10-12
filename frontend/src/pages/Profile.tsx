import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useParams, useNavigate } from "react-router-dom";
import { getMyProfile, getUser, updateMyProfile, type User } from "../services/users";
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
	const { username: myUsername, updateUsername} = useAuth();
	const navigate = useNavigate();
	const { theme } = useTheme();

	const [user, setUser] = useState<User | null>(null);

	const [editingUsername, setEditingUsername] = useState(false);
	const [editingEmail, setEditingEmail] = useState(false);

	const [newUsername, setNewUsername] = useState("");
	const [newEmail, setNewEmail] = useState("");

	const [savingProfile, setSavingProfile] = useState(false);
	const [profileMessage, setProfileMessage] = useState("");

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

	async function handleSaveUsername() {
		setSavingProfile(true);
		setProfileMessage("");

		try {
			const result = await updateMyProfile({
				username: newUsername.trim(),
			});

			if (!result.ok) {
				setProfileMessage(
					result.data.message || "Unable to update username"
				);
				return;
			}

			const updatedUser = result.data.user;
			const finalUsername = updatedUser?.username ?? newUsername.trim();

			if (updatedUser) {
				setUser(updatedUser);
			} else {
				setUser((current) =>
					current
						? { ...current, username: finalUsername }
						: current
				);
			}

			updateUsername(finalUsername);
			navigate(`/profile/${encodeURIComponent(finalUsername)}`, { replace: true, });
			setEditingUsername(false);
		} catch {
			setProfileMessage("An error occurred");
		} finally {
			setSavingProfile(false);
		}
	}

	async function handleSaveEmail() {
		setSavingProfile(true);
		setProfileMessage("");

		try {
			const result = await updateMyProfile({
				email: newEmail.trim(),
			});

			if (!result.ok) {
				setProfileMessage(
					result.data.message || "Unable to update email"
				);
				return;
			}

			const updatedUser = result.data.user;

			if (updatedUser) {
				setUser(updatedUser);
			} else {
				setUser((current) =>
					current
						? { ...current, email: newEmail.trim() }
						: current
				);
			}

			setEditingEmail(false);
		} catch {
			setProfileMessage("An error occurred");
		} finally {
			setSavingProfile(false);
		}
	}

	async function handleSaveAvatar(file: File) {
		setSavingProfile(true);
		setProfileMessage("");

		try {
			if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
				setProfileMessage("Choose a PNG, JPEG or WebP image");
				return;
			}

			if (file.size > 180 * 1024) {
				setProfileMessage("The image must be smaller than 180 KB");
				return;
			}

			const avatar = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();

				reader.onload = () => {
					if (typeof reader.result === "string") {
						resolve(reader.result);
					} else {
						reject(new Error("Unable to read image"));
					}
				};

				reader.onerror = () => reject(new Error("Unable to read image"));
				reader.readAsDataURL(file);
			});

			const result = await updateMyProfile({ avatar });

			if (!result.ok) {
				setProfileMessage(
					result.data.message || "Unable to update avatar"
				);
				return;
			}

			if (result.data.user) {
				setUser(result.data.user);
			} else {
				setUser((current) =>
					current ? { ...current, avatar } : current
				);
			}
		} catch {
			setProfileMessage("An error occurred while updating the avatar");
		} finally {
			setSavingProfile(false);
		}
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
							<div className="relative">
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

								{isMyProfile && (
									<>
										<input
											type="file"
											accept="image/png,image/jpeg,image/webp"
											id="avatar-upload"
											className="hidden"
											onChange={(event) => {
												const file = event.target.files?.[0];

												if (file) {
													void handleSaveAvatar(file);
												}

												event.target.value = "";
											}}
										/>

										<label
											htmlFor="avatar-upload"
											title="Modifier l'avatar"
											className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-slate-900 bg-indigo-600 text-lg shadow-lg transition hover:bg-indigo-500"
										>
											✏️
										</label>
									</>
								)}
							</div>
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
							<p className="text-sm text-slate-400">Username</p>

							{editingUsername ? (
								<div className="mt-2 space-y-3">
									<input
										value={newUsername}
										onChange={(event) => setNewUsername(event.target.value)}
										className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
										placeholder="New username"
									/>

									<div className="flex gap-2">
										<button
											onClick={handleSaveUsername}
											disabled={savingProfile || !newUsername.trim()}
											className="rounded-lg bg-blue-600 px-3 py-2 disabled:opacity-50"
										>
											Save
										</button>

										<button
											onClick={() => setEditingUsername(false)}
											className="rounded-lg bg-slate-700 px-3 py-2"
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between gap-3">
									<p className="text-xl font-semibold">{user.username}</p>

									{isMyProfile && (
										<button
											onClick={() => {
												setNewUsername(user.username);
												setEditingUsername(true);
												setProfileMessage("");
											}}
											title="edit"
											className="text-blue-400 hover:text-blue-300"
										>
											✏️
										</button>
									)}
								</div>
							)}
						</div>


						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">Mail</p>

							{editingEmail ? (
								<div className="mt-2 space-y-3">
									<input
										type="email"
										value={newEmail}
										onChange={(event) => setNewEmail(event.target.value)}
										className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
										placeholder="New email"
									/>

									<div className="flex gap-2">
										<button
											onClick={handleSaveEmail}
											disabled={savingProfile || !newEmail.trim()}
											className="rounded-lg bg-blue-600 px-3 py-2 disabled:opacity-50"
										>
											Save
										</button>

										<button
											onClick={() => setEditingEmail(false)}
											className="rounded-lg bg-slate-700 px-3 py-2"
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between gap-3">
									<p className="break-all text-white">
										{user.email}
									</p>

									{isMyProfile && (
										<button
											onClick={() => {
												setNewEmail(user.email || "");
												setEditingEmail(true);
												setProfileMessage("");
											}}
											title="edit"
											className="text-blue-400 hover:text-blue-300"
										>
											✏️
										</button>
									)}
								</div>
							)}
						</div>


						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">
								Created at
							</p>

							<p className="text-sm">
								{new Date(user.createdAt).toLocaleString("fr-FR")}
							</p>
						</div>


						<div className={`rounded-lg container-theme-${theme} p-4`}>
							<p className="text-sm text-slate-400">
								Last update
							</p>

							<p className="text-sm">
								{new Date(user.updatedAt).toLocaleString("fr-FR")}
							</p>
						</div>
						
						{profileMessage && (
							<p className="rounded-lg bg-red-900/40 border border-red-700 p-3 text-center text-red-300">
								{profileMessage}
							</p>
						)}

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
