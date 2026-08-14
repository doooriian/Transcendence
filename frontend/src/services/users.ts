export type User = {
	id: number;
	username: string;
	createdAt: string;
	updatedAt: string;
};

export type UserSearchResult = {
	username: string;
};

export async function searchUsers(query: string) {
	const token = localStorage.getItem("token");

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/users?username=${encodeURIComponent(query)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		users: data.users as UserSearchResult[],
	};
}

export async function getMyProfile() {
	const token = localStorage.getItem("token");

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/auth/me`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data: data.user,
	};
}

export async function getUser(username: string) {
	const token = localStorage.getItem("token");

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/users/${username}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data: data.user,
	};
}