import App from '../App';

import { createBrowserRouter } from "react-router-dom";
import { HomePage } from '@pages/HomePage';
import { Login } from '@pages/Login';
import { Register } from '@pages/Register';
import { NotFound } from '@pages/NotFound';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [

      // -------- RUTAS PÚBLICAS --------
      {
        path: "login",
        element: <Login />
      },
      {
        path: "register",
        element: <Register />
      },

      // (home por ahora sigue aquí, luego la moveremos)
      {
        index: true,
        element: <HomePage />
      },

      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);
