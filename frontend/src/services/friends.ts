import { apiFetch } from "./api";

export type Friend = {
	authId: string,
	username: string;
	isOnline: boolean;
};

export type FriendRequest = {
	id: number;
	username: string;
};

function getAuthHeaders() {
	return {
		"Content-Type": "application/json",
	};
}


export async function getFriends() {
	const response = await apiFetch("/api/friends",
		{
			headers: getAuthHeaders(),
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		friends: data.friends as Friend[],
	};
}


export async function getFriendRequests() {
	const response = await apiFetch("/api/friends/requests",
		{
			headers: getAuthHeaders(),
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		received: data.received as FriendRequest[],
		sent: data.sent as FriendRequest[],
	};
}


export async function sendFriendRequest(username: string) {
	const response = await apiFetch("/api/friends/requests",
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify({
				username,
			}),
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data,
	};
}


export async function acceptFriendRequest(id: number) {
	const response = await apiFetch(`/api/friends/requests/${id}/accept`,
		{
			method: "POST",
			headers: getAuthHeaders(),
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data,
	};
}


export async function deleteFriendRequest(id: number) {
	const response = await apiFetch(`/api/friends/requests/${id}`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data,
	};
}


export async function removeFriend(username: string) {
	const response = await apiFetch(`/api/friends/users/${username}`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);

	const data = await response.json();

	return {
		ok: response.ok,
		data,
	};
}
