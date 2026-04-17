import { buildApiError } from "./ApiError";

const apiUrl = import.meta.env.PUBLIC_API_URL;

export type LoginResponse = {
	requires2fa?: boolean;
	user?: {
		id: number;
		login: string;
		email: string;
		tempToken: string;
	};
	message?: string;
	errors?: Record<string, string>;
};

export type AuthMeResponse = {
	user?: {
		id: number;
		login: string;
		email: string;
	};
	message?: string;
};

export async function Login(identifier: string, password: string) {
	const res = await fetch(`${apiUrl}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ identifier: identifier.trim(), password }),
	});

	const data: LoginResponse = await res.json().catch(() => null);

	if (!res.ok)
		throw buildApiError(res, data);

	return data;
}

export async function Login2FA(code: string) {
	const res = await fetch(`${apiUrl}/2fa/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ code }),
	});

	if (!res.ok) {
		const data = await res.json().catch(() => null);
		throw buildApiError(res, data);
	}

	return true;
}

export async function getAuthenticatedUser() {
	const res = await fetch(`${apiUrl}/auth/me`, {
		method: "GET",
		credentials: "include",
	});

	const data: AuthMeResponse = await res.json().catch(() => null);

	if (!res.ok) {
		throw buildApiError(res, data);
	}

	return data;
}
