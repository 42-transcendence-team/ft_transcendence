import { PrivateLayout } from "layouts/privateLayout"

import { HomePage } from "@pages/HomePage"
import { Profile } from "@pages/Profile"
import { Settings } from "@pages/Settings"


export const PrivateRoutes = {
	path: "app",
	element: <PrivateLayout />,
	children: [
		{ index: true, element: <HomePage /> },
		// Aquí irán más privadas: profile, settings, chat, etc.
		{ path: "profile/:username", element: <Profile /> },
		{ path: "settings", element: <Settings /> },
	],
}