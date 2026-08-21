import { apiRequest } from "./ApiRequest";

export async function AddChat() {
	const data = await apiRequest({
		endpoint: "websocket/rooms",
		method: "POST",
		body: { name: `Room ${Math.floor(Math.random() * 1000)}` },
	});
	return data;
}
