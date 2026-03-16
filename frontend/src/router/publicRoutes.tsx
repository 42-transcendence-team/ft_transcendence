import { Login } from "@pages/Login";
import { Register } from "@pages/Register";
import { ForgotPassword } from "@pages/ForgotPassword";
import { ResetPassword } from "@pages/ResetPassword";
import { About } from "@pages/About";
import { FAQ } from "@pages/FAQ";
import { Developers } from "@pages/Developers";
import { Cookies } from "@pages/Cookies";
import { Contact } from "@pages/Contact";
import { PrivacyPolicy } from "@pages/PrivacyPolicy";
import { PublicLayout } from "layouts/publicLayout"
import { HomePage } from "@pages/HomePage";

export const PublicRoutes = {
	path: "/",
	element: <PublicLayout />,
	children: [
		{ path: "/", element: <HomePage /> },
		{ path: "login", element: <Login /> },
		{ path: "register", element: <Register /> },
		{ path: "forgot-password", element: <ForgotPassword /> },
		{ path: "reset-password/:token", element: <ResetPassword /> },
		{ path: "about", element: <About /> },
		{ path: "faq", element: <FAQ /> },
		{ path: "developers", element: <Developers /> },
		{ path: "cookies", element: <Cookies /> },
		{ path: "contact", element: <Contact /> },
		{ path: "privacy-policy", element: <PrivacyPolicy /> },
	],
};