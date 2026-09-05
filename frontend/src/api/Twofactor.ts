import { apiRequest } from "./ApiRequest";

export async function enable2FA(): Promise<{ QR?: string }> {
	const data = apiRequest<{ QR?: string }>({
		endpoint: "2fa/enable",
		method: "POST",
	});
 
	return data;
}

export async function verify2FA(code: string) {
	const data = apiRequest({
		endpoint: "2fa/verify",
		method: "POST",
		body: { code },
	});

	return data;
}

export async function disable2FA(code: string) {
	const data = apiRequest({
		endpoint: "2fa/disable",
		method: "POST",
		body: { code },
	});

	return data;
}
