import App from "../App";
import { createBrowserRouter } from "react-router-dom";

import { NotFound } from "@pages/NotFound";

import { PublicRoutes } from "./publicRoutes";
import { PrivateRoutes } from "./privateRoutes"

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			PublicRoutes,
			PrivateRoutes,
			// ---------- NOT FOUND ----------
			{ path: "*", element: <NotFound /> },
		],
	},
]);
