import { apiRequest } from "./ApiRequest"

export type RegisterPayload = {
	login: string
	email: string
	password: string
	confirmPassword: string
	name: string
	surname: string
	birthday: string
	termsAndConditions: boolean
	privacyPolicy: boolean
}

export type RegisterResponse = {
	message?: string
	error?: string
	[key: string]: unknown
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
	const data = apiRequest({
		endpoint: "auth/register",
		method: "POST",
		body: payload,
	})

	return data
}
