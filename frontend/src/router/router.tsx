import App from "../App";
import { createBrowserRouter } from "react-router-dom";

import { NotFound } from "@pages/NotFound";

import { PublicRoutes } from "./publicRoutes";
import { PrivateRoutes } from "./privateRoutes"
import { PublicNoAuthRoutes } from "./publicNoAuthRoutes";


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


