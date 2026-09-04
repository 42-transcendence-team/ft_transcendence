import { NotFoundRoute } from '@components/auth-router/NotFoundRoute';
import { RootRedirect } from '@components/auth-router/RootRedirect';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { PrivateRoutes } from './privateRoutes';
import { PublicNoAuthRoutes } from './publicNoAuthRoutes';
import { PublicRoutes } from './publicRoutes';

// loader
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    HydrateFallback: () => <div>Cargando aplicación...</div>, // Deberiamos hacer un componente de carga comun y bonmito
    children: [
      { index: true, element: <RootRedirect /> },
      PublicRoutes,
      PublicNoAuthRoutes,
      PrivateRoutes,
      // ---------- NOT FOUND ----------
      { path: '*', element: <NotFoundRoute /> },
    ],
  },
]);
