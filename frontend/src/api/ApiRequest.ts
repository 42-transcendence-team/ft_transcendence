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
	data?: any;
};

export async function apiRequest<T = any>(props: ApiRequestProps): Promise<T> {
	const {endpoint, body, method = "GET", includeCredentials = true} = props;

	/*
	 * FormData no debe serializarse como JSON.
	 * El navegador añadirá automáticamente el Content-Type multipart
	 * junto con el boundary correspondiente.
	 */
	const isFormData =
		typeof FormData !== "undefined" && body instanceof FormData;

	const config: RequestInit = {
		method,

		// Solo añadimos Content-Type cuando enviamos JSON.
		headers: isFormData
			? undefined
			: { "Content-Type": "application/json" },

		credentials: includeCredentials ? "include" : "same-origin",

		// FormData se envía directamente; el resto se serializa como JSON.
		body: body
			? isFormData
				? body
				: JSON.stringify(body)
			: undefined,
	};

	const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

	/*
	 * Leemos el cuerpo una sola vez y admitimos respuestas vacías,
	 * habituales en operaciones DELETE con estado 204.
	 */
	const data = await parseResponseBody(res);

	/*
	 * auth/me tiene un comportamiento especial:
	 * aunque haya respuesta, la sesión solo es válida si authenticated es true.
	 */
	if (endpoint === "auth/me") {
		const authData = data as { authenticated?: boolean } | undefined;

		if (authData?.authenticated) {
			return data as T;
		}

		throw buildApiError(res, data);
	}

	// Centralizamos el tratamiento de todos los errores HTTP.
	if (!res.ok) {
		throw buildApiError(res, data);
	}

	return data as T;
}

/*
 * Convierte respuestas JSON y evita errores al procesar
 * respuestas correctas que no contienen cuerpo.
 */
async function parseResponseBody(res: Response): Promise<any> {
	const text = await res.text();

	if (!text) {
		return undefined;
	}

	try {
		return JSON.parse(text);
	} catch (error) {
		/*
		 * Si la respuesta HTTP ya es un error, dejamos que buildApiError
		 * genere un error normalizado aunque el cuerpo no sea JSON válido.
		 */
		if (!res.ok) {
			return null;
		}

		throw error;
	}
}

/*
 * Unifica el formato de los errores que reciben los componentes.
 */
export function buildApiError(res: Response, data: any): ApiError {
	return {
		status: res.status,
		message:
			data?.message ||
			data?.error?.message ||
			"Unexpected error",
		data,
	};
}
