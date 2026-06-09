import { About } from "@pages/About";
import { FAQ } from "@pages/FAQ";
import { Developers } from "@pages/Developers";
import { Cookies } from "@pages/Cookies";
import { Contact } from "@pages/Contact";
import { PrivacyPolicy } from "@pages/PrivacyPolicy";
import { PublicLayout } from "layouts/publicLayout"
import { ForgotPassword } from "@pages/ForgotPassword";
import { ResetPassword } from "@pages/ResetPassword";
import Register42 from "@pages/Register42";


export const PublicRoutes = {
	element: <PublicLayout />,
	children: [
		{ path: "about", element: <About /> },
		{ path: "faq", element: <FAQ /> },
		{ path: "developers", element: <Developers /> },
		{ path: "cookies", element: <Cookies /> },
		{ path: "contact", element: <Contact /> },
		{ path: "privacy-policy", element: <PrivacyPolicy /> },
		{ path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password/:token", element: <ResetPassword /> },
		{ path: "42register", element: <Register42 /> }
	],
};