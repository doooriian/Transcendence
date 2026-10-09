import { apiFetch } from "./api";

export type Friend = {
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


// Récupérer mes amis
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


// Récupérer mes demandes reçues et envoyées
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


// Envoyer une demande
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


// Accepter une demande
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


// Refuser une demande OU annuler une demande envoyée
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


// Supprimer un ami
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
