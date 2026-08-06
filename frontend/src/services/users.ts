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