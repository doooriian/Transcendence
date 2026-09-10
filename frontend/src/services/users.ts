import { apiFetch } from "./api";

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
	const response = await apiFetch(
		`${import.meta.env.VITE_API_URL}/api/users?username=${encodeURIComponent(query)}`,
	);

	const data = await response.json();

	return {
		ok: response.ok,
		users: data.users as UserSearchResult[],
	};
}

export async function getMyProfile() {
	const response = await apiFetch(
		`${import.meta.env.VITE_API_URL}/api/auth/me`,
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data: data.user,
	};
}

export async function getUser(username: string) {
	const response = await apiFetch(
		`${import.meta.env.VITE_API_URL}/api/users/${username}`,
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data: data.user,
	};
}
