import App from "../App";
import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "@pages/HomePage";
import { NotFound } from "@pages/NotFound";

import { PrivateLayout } from "@components/PrivateLayout";
import { PublicRoutes } from "./publicRoutes";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			PublicRoutes,
			{
				path: "app",
				element: <PrivateLayout />,
				children: [
					{ index: true, element: <HomePage /> },
					// Aquí irán más privadas: profile, settings, chat, etc.
					// { path: "profile/:username", element: <Profile /> },
				],
			},
			// ---------- NOT FOUND ----------
			{ path: "*", element: <NotFound /> },
		],
	},
]);
