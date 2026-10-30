import { apiFetch } from "./api";

export type User = {
    id: number;
    username: string;
    email?: string;
    avatar?: string | null;
    createdAt: string;
    updatedAt: string;
};

function getAuthHeaders() {
	return {
		"Content-Type": "application/json",
	};
}	

export type UserSearchResult = {
	username: string;
};

export async function searchUsers(query: string) {
	const response = await apiFetch(
		`/api/users?username=${encodeURIComponent(query)}`,
	);

	const data = await response.json();

	return {
		ok: response.ok,
		users: data.users as UserSearchResult[],
	};
}

export async function getMyProfile() {
	const response = await apiFetch("/api/auth/me");

	const data = await response.json();

	return {
		ok: response.ok,
		data: data.user,
	};
}

export async function getUser(username: string) {
	const response = await apiFetch(`/api/users/${username}`);

	const data = await response.json();

	return {
		ok: response.ok,
		data: data.user,
	};
}

export async function updateMyProfile( updates: Partial<Pick<User, "username" | "email" | "avatar">> ) {
	const response = await apiFetch("/api/users/me", {
		method: "PATCH",
		headers: getAuthHeaders(),
		body: JSON.stringify(updates),
	});

	const data = await response.json();

	return {
		ok: response.ok,
		data: data.user ?? data,
	};

}
