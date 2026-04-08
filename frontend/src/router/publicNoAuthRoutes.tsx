import { Login } from "@pages/Login";
import { Register } from "@pages/Register";


import { PublicLayout } from "layouts/publicLayout"

export const PublicNoAuthRoutes = {
    element: <PublicLayout />,
    children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        
    ],
};

