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
	console.log("res", res);
	let data: LoginResponse | null = null;
	try {
		data = await res.json();
	} catch {
		data = null;
	}
	// console.log("data", data);

	// todo se hace en rama redis 
  // const data: LoginResponse = await res.json().catch(() => null);

	if (!res.ok)
		throw buildApiError(res, data);

	return data;
}

//todo
// export async function Logout() {
//     const res = await fetch(`${apiUrl}/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//     });
//     return res.ok;
// }


export async function GetMyProfile() {
    const res = await fetch(`${apiUrl}/users/me`, {
        method: "GET",
        credentials: "include", // jwt cockie
    });
    if (!res.ok)
		throw new Error("No se pudo cargar el perfil");
    return await res.json();
}

//todo para pillar los usuarios de los amigos 
// export async function GetProfile(login: string) {
//     const res = await fetch(`${apiUrl}/users/profile/${login}`, {
//         method: "GET",
//         credentials: "include", // Importante para enviar el JWT en la cookie
//     });
//     if (!res.ok)
// 		throw new Error("No se pudo cargar el perfil");
//     return await res.json();
// }


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
