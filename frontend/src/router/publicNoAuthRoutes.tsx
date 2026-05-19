import { Login } from "@pages/Login";
import { Register } from "@pages/Register";

import { PublicLayout } from "layouts/publicLayout";
import { GuestRoute } from "@components/auth-router/GuestRoute";

export const PublicNoAuthRoutes = {
  element: (
    <GuestRoute>
      <PublicLayout />
    </GuestRoute>
  ),
  children: [
    { path: "login", element: <Login /> },
    { path: "register", element: <Register /> },
  ],
};
