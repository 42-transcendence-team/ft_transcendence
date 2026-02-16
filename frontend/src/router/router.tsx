import App from '../App';

import { createBrowserRouter } from "react-router-dom";
import { HomePage } from '@pages/HomePage';
import { Login } from '@pages/Login';
import { NotFound } from '@pages/NotFound';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,    
        element: <HomePage /> 
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);