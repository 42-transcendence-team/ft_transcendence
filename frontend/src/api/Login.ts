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

export async function Login(identifier: string, password: string) {
	const res = await fetch(`${apiUrl}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify({ identifier: identifier.trim(), password }),
	});

	let data: LoginResponse | null = null;
	try {
		data = await res.json();
	} catch {
		data = null;
	}

	if (!res.ok && !data?.requires2fa) {
		throw { status: res.status, data };
	}

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
		throw new Error(data?.message || "invalid 2FA code");
	}

	return true;
}