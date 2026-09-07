function handleUnauthorized() {
	localStorage.removeItem("token");
	localStorage.removeItem("username");

	window.dispatchEvent(new Event("unauthorized"));
}

export async function apiFetch(
	url: string,
	options: RequestInit = {},
) {
	const token = localStorage.getItem("token");

	const headers = {
		...options.headers,
		Authorization: `Bearer ${token}`,
	};

	const response = await fetch(url, {
		...options,
		headers,
	});

	if (response.status === 401) {
		handleUnauthorized();
	}

	return response;
}