export async function apiFetch(
	url: string,
	options: RequestInit = {},
) {
	const token = localStorage.getItem("token");

	const headers = {
		...options.headers,
		...(token ? { Authorization: `Bearer ${token}` } : {})
	};

	const response = await fetch(url, {
		...options,
		headers,
	});

	if (response.status === 401) {
		window.dispatchEvent(new Event("unauthorized"));
	}

	return response;
}