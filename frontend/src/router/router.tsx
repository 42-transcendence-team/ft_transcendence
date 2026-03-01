import App from "../App";
import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "@pages/HomePage";
import { Login } from "@pages/Login";
import { Register } from "@pages/Register";
import { NotFound } from "@pages/NotFound";

import { PrivateLayout } from "@components/PrivateLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // ---------- RUTAS PÚBLICAS ----------
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

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

      // ---------- NOT FOUND ----------
      { path: "*", element: <NotFound /> },
    ],
  },
]);
