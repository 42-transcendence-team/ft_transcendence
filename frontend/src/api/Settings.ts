const apiUrl = import.meta.env.PUBLIC_API_URL;

export async function settingsLoader() {
	const res = await fetch(`${apiUrl}/users/settings`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw { status: res.status, data };
	}
	const data = await res.json();
	return data;
}