import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser, type User } from "../services/users";

function Profile() {
	const { username } = useParams();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		async function loadUser() {
			if (!username)
				return;

			const result = await getUser(username);

			if (result.ok)
				setUser(result.data);
		}
		loadUser();
	}, [username]);

	if (!user) {
		return <p>Loading...</p>;
	}

	return (
		<main>
			<h1>Profile</h1>

			<p>Id : {user.id}</p>

			<p>Username : {user.username}</p>

			<p>Created : {user.createdAt}</p>

			<p>Updated : {user.updatedAt}</p>
		</main>
	);
}

export default Profile;