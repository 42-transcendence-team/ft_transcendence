import { buildApiError } from "./ApiError";

const apiUrl = import.meta.env.PUBLIC_API_URL;

type SettingsFields = {
	email?: string;
	verify_email?: string;
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
		throw buildApiError(res, data);
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
		throw buildApiError(res, data);
	}
	const data = await res.json();
	return data;
}

export async function updateData(settings: SettingsFields) {
	const res = await fetch(`${apiUrl}/users/update-user`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(settings),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw buildApiError(res, data);
	}
	const data = await res.json();
	return data;
}

export async function updatePassword(settings: SettingsFields) {
	const res = await fetch(`${apiUrl}/users/update-password`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(settings),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw buildApiError(res, data);
	}
	const data = await res.json();
	return data;
}

export async function updateEmail(settings: SettingsFields) {
	const res = await fetch(`${apiUrl}/users/update-email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(settings),
	});
	console.log("Update Email Request:", settings);
	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw buildApiError(res, data);
	}
	const data = await res.json();
	return data;
}