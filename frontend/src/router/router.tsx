import App from "../App";
import { createBrowserRouter } from "react-router-dom";

import { NotFoundRoute } from "@components/auth-router/NotFoundRoute";

import { PublicRoutes } from "./publicRoutes";
import { PrivateRoutes } from "./privateRoutes"
import { PublicNoAuthRoutes } from "./publicNoAuthRoutes";
import { RootRedirect } from "@components/auth-router/RootRedirect";

// loader 
export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		HydrateFallback: () => <div>Cargando aplicación...</div>, // Deberiamos hacer un componente de carga comun y bonmito
		children: [
			{ index: true, element: <RootRedirect /> },
			PublicRoutes,
			PublicNoAuthRoutes,
			PrivateRoutes,
			// ---------- NOT FOUND ----------
			{ path: "*", element: <NotFoundRoute /> },
		],
	},
]);


