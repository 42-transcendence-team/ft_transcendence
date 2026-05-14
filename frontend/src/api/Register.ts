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

export const registerUser = async (
	payload: RegisterPayload,
): Promise<RegisterResponse> => {
	const response = await fetch("http://localhost:8080/api/v1/auth/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})

	const data: RegisterResponse = await response.json()

	if (!response.ok) {
		throw {
			status: response.status,
			data,
		}
	}

	return data
}
