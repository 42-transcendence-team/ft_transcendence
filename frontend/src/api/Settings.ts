const apiUrl = import.meta.env.PUBLIC_API_URL;

type SettingsFields = {
	email?: string;
	password?: string;
	name?: string;
	surname?: string;
	birthday?: string;
};

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

export async function updateSettings(settings: SettingsFields) {
	const res = await fetch(`${apiUrl}/users/update`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(settings),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw { status: res.status, data };
	}
	const data = await res.json();
	return data;
}