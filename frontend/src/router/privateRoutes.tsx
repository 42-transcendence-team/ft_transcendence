import { PrivateLayout } from "layouts/privateLayout";

import { HomePage } from "@pages/HomePage";
import { Profile } from "@pages/Profile";

import { ProtectedRoute } from "@components/auth-router/ProtectedRoute";

export const PrivateRoutes = {
  path: "app",
  element: (
    <ProtectedRoute>
      <PrivateLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <HomePage /> },
    { path: "profile/:username", element: <Profile /> },
  ],
};
