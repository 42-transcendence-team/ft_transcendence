import { apiRequest } from "./ApiRequest";

export type LoginResponse = {
	requires2fa?: boolean;
	user?: {
		id: number;
		login: string;
		email: string;
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
	const data = await apiRequest({
		endpoint: "auth/login",
		method: "POST",
		body: { identifier: identifier.trim(), password },
	});
	return data;
}

export async function GetMyProfile() {
    const data = apiRequest({
		endpoint: "users/me",
	});
	return data;
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
	const data = await apiRequest({
		endpoint: "2fa/login",
		method: "POST",
		body: {
			code: code,
		},
	});

	return data;
}

export async function getAuthenticatedUser() {
	const data = await apiRequest({
		endpoint: "auth/me",
	});
	
	return data;
}