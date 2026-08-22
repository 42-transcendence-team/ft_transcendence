export const API_BASE_URL = "/api/v1/";

interface ApiRequestProps {
	endpoint: string;
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	body?: unknown;
	includeCredentials?: boolean;
}

// export async function apiRequest(props: ApiRequestProps): Promise<any> {
//     const { endpoint, body, method = "GET", includeCredentials = true } = props;

//     const config: RequestInit = {
//         method,
//         headers: { "Content-Type": "application/json" },
//         credentials: includeCredentials ? "include" : "same-origin",
//         body: body ? JSON.stringify(body) : undefined,
//     };
//     const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
	
//     if (endpoint == "auth/me") {
//         const data = await res.json();
//         if (data.authenticated) {
//             return data;
//         }
//         const errorData = data.catch(() => null)
//         throw buildApiError(res, errorData);
//     }

//     if (!res.ok) {
// 		const errorData = await res.json().catch(() => null);
//         throw buildApiError(res, errorData);
//     }

//     return res.json();
// }

export type ApiError = {
	status: number;
	message: string;
	data?: unknown;
};

export async function apiRequest<T = unknown>(props: ApiRequestProps,): Promise<T> {
	const {
		endpoint,
		body,
		method = "GET",
		includeCredentials = true,
	} = props;

	/*
	 * FormData no debe serializarse como JSON.
	 * El navegador añadirá automáticamente el Content-Type
	 * multipart/form-data y su boundary.
	 */
	const isFormData =
		typeof FormData !== "undefined" && body instanceof FormData;

	const hasBody = body !== undefined && body !== null;

	const config: RequestInit = {
		method,

		/*
		 * Solo añadimos Content-Type cuando realmente enviamos JSON.
		 * Para FormData no debemos establecerlo manualmente.
		 */
		headers:
			hasBody && !isFormData
				? { "Content-Type": "application/json" }
				: undefined,

		credentials: includeCredentials ? "include" : "same-origin",

		/*
		 * FormData se envía directamente.
		 * El resto de cuerpos se convierte a JSON.
		 */
		body: hasBody
			? isFormData
				? body
				: JSON.stringify(body)
			: undefined,
	};

	const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

	/*
	 * Leemos el cuerpo una única vez.
	 * También permite respuestas vacías, como DELETE con 204.
	 */
	const data = await parseResponseBody(res);

	/*
	 * auth/me tiene un comportamiento especial.
	 * La sesión solo es válida cuando authenticated es true.
	 */
	if (endpoint === "auth/me") {
		const authData = data as
			| { authenticated?: boolean }
			| undefined;

		if (res.ok && authData?.authenticated === true) {
			return data as T;
		}

		throw buildApiError(res, data);
	}

	/*
	 * Tratamiento centralizado de errores HTTP.
	 */
	if (!res.ok) {
		throw buildApiError(res, data);
	}

	return data as T;
}

/*
 * Convierte respuestas JSON y admite respuestas sin cuerpo.
 */
async function parseResponseBody(res: Response): Promise<unknown> {
	const text = await res.text();

	if (!text) {
		return undefined;
	}

	try {
		return JSON.parse(text);
	} catch {
		/*
		 * Si la respuesta es un error y no contiene JSON válido,
		 * devolvemos el texto para poder mostrarlo en ApiError.
		 */
		if (!res.ok) {
			return text;
		}

		/*
		 * Si la respuesta correcta es texto plano,
		 * también la devolvemos directamente.
		 */
		return text;
	}
}

/*
 * Unifica el formato de los errores que reciben los componentes.
 */
export function buildApiError(res: Response, data: unknown): ApiError {
	const errorData =
		typeof data === "object" && data !== null
			? (data as {
					message?: string;
					error?: {
						message?: string;
					};
				})
			: undefined;

	return {
		status: res.status,
		message:
			errorData?.message ??
			errorData?.error?.message ??
			(typeof data === "string" && data
				? data
				: "Unexpected error"),
		data,
	};
}
