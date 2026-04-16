import { buildApiError } from "./ApiError";

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
		throw buildApiError(res, data);
	}
	const data = await res.json();
	return data;
}

export type DataSettings = {
	code?: string;
	name?: string;
	surname?: string;
	birthday?: string;
};

export async function updateData(settings: DataSettings) {
	const res = await fetch(`${apiUrl}/users/data`, {
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

export type PasswordSettings = {
	code?: string;
	previous_password: string;
	password: string;
	verify_password: string;
};

export async function updatePassword(settings: PasswordSettings) {
	const res = await fetch(`${apiUrl}/users/password`, {
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

export type EmailSettings = {
	code?: string;
	email: string;
	verify_email: string;
};

export async function updateEmail(settings: EmailSettings) {
	const res = await fetch(`${apiUrl}/users/email`, {
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

export type DeleteSettings = {
	password: string;
	code?: string;
};

export async function deleteAccount(settings: DeleteSettings) {
	const res = await fetch(`${apiUrl}/users/delete`, {
		method: "DELETE",
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