import { apiRequest } from "./ApiRequest";

export async function settingsLoader() {
	const data = apiRequest({
		endpoint: "users/settings",
	});
	
	return data;
}

export type DataSettings = {
	code?: string;
	name?: string;
	surname?: string;
	birthday?: string;
	status?: string;
};

export async function updateData(settings: DataSettings) {
	const data = await apiRequest({
		endpoint: "users/data",
		method: "POST",
		body: settings,
	});

	return data;
}

export type PasswordSettings = {
	code?: string;
	previous_password: string;
	password: string;
	verify_password: string;
};

export async function updatePassword(settings: PasswordSettings) {
	const data = await apiRequest({
		endpoint: "users/password",
		method: "POST",
		body: settings,
	});

	return data;
}

export type EmailSettings = {
	code?: string;
	email: string;
	verify_email: string;
};

export async function updateEmail(settings: EmailSettings) {
	const data = await apiRequest({
		endpoint: "users/email",
		method: "POST",
		body: settings,
	});

	return data;
}

export type DeleteSettings = {
	password: string;
	code?: string;
};

export async function deleteAccount(settings: DeleteSettings) {
	const data = await apiRequest({
		endpoint: "users/delete",
		method: "DELETE",
		body: settings,
	});

	return data;
}
