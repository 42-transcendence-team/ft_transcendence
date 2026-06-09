import { apiRequest } from "./ApiRequest"

export type RegisterPayload = {
	login: string
	email: string
	password: string
	confirmPassword: string
	first_name: string
	last_name: string
	birthday: string
}

export type RegisterResponse = {
	message?: string
	error?: string
	[key: string]: unknown
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
	const data = await apiRequest({
		endpoint: "auth/register",
		method: "POST",
		body: payload,
	})

	return data
}

interface User42Data {
	login: string;
	email: string;
	first_name: string;
	last_name: string;
}

export async function get42UserInfo(): Promise<User42Data> {
	const data = await apiRequest({
		endpoint: `auth/42/userInfo`,
		method: "GET",
	})

	return data
}

export async function register42User(payload: RegisterPayload): Promise<RegisterResponse> {
	const data = await apiRequest({
		endpoint: "auth/42/register",
		method: "POST",
		body: payload,
	})

	return data
}