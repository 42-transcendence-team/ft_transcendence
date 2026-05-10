import { redirect } from "react-router-dom";

import { PrivateLayout } from "layouts/privateLayout";
import { HomePage } from "@pages/HomePage"
import { Profile } from "@pages/Profile"
import { Settings } from "@pages/Settings"
import { settingsLoader } from "../api/Settings"

import { getAuthenticatedUser } from "../api/Login";

const privateLoader = async () => {
	try {
		await getAuthenticatedUser();
		return null;
	} catch {
		throw redirect("/login");
	}
};

export const PrivateRoutes = {
	path: "app",
	loader: privateLoader,
	element: <PrivateLayout />,
	children: [
		{ index: true, element: <HomePage /> },
		{ path: "profile/:username", element: <Profile /> },
		{ path: "settings", element: <Settings />, loader: settingsLoader },
	],
};
