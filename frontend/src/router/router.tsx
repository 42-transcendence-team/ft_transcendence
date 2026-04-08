import App from "../App";
import { createBrowserRouter } from "react-router-dom";

import { NotFound } from "@pages/NotFound";

import { PublicRoutes } from "./publicRoutes";
import { PrivateRoutes } from "./privateRoutes"
import { PublicNoAuthRoutes } from "./publicNoAuthRoutes";


type AuthStatus = "loading" | "auth" | "guest"
const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

// loader 
export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			PublicRoutes,
			PublicNoAuthRoutes,
			PrivateRoutes,
			// ---------- NOT FOUND ----------
			{ path: "*", element: <NotFound /> },
		],
	},
]);

const response = await fetch("http://localhost:8080/api/v1/auth/me", {
    method: "GET",
    credentials: "include",
});

