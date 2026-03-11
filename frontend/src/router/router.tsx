import App from "../App";
import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "@pages/HomePage";
import { Login } from "@pages/Login";
import { Register } from "@pages/Register";
import { NotFound } from "@pages/NotFound";
import { ForgotPassword } from "@pages/ForgotPassword";
import { ResetPassword } from "@pages/ResetPassword";
import { About } from "@pages/About";
import { FAQ } from "@pages/FAQ";
import { Developers } from "@pages/Developers";
import { Cookies } from "@pages/Cookies";
import { Contact } from "@pages/Contact";
import { PrivacyPolicy } from "@pages/PrivacyPolicy";
import { PrivateLayout } from "@components/PrivateLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // ---------- RUTAS PÚBLICAS ----------
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },


	  { path: "forgot-password", element: <ForgotPassword /> },
	  { path: "reset-password/:token", element: <ResetPassword /> },

	  { path: "about", element: <About /> },
	  { path: "faq", element: <FAQ /> },
	  { path: "developers", element: <Developers /> },
	  { path: "cookies", element: <Cookies /> },
	  { path: "contact", element: <Contact /> },
	  { path: "privacy-policy", element: <PrivacyPolicy />},
      // ---------- RUTAS PRIVADAS ----------
      // Todas las privadas cuelgan de un layout común.
      {
        element: <PrivateLayout />,
        children: [
          { index: true, element: <HomePage /> },
          // Aquí irán más privadas: profile, settings, chat, etc.
          // { path: "profile/:username", element: <Profile /> },
        ],
      },

>>>>>>> main
      // ---------- NOT FOUND ----------
      { path: "*", element: <NotFound /> },
    ],
  },
]);
