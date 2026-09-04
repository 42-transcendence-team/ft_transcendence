import { useAuth } from '@components/auth-router/AuthContext';
import { NotFound } from '@pages/NotFound';
import { Navigate } from 'react-router-dom';

// Controla las rutas inexistentes.
// Los guests se redirigen a login.
// Los usuarios autenticados ven el 404.
export const NotFoundRoute = () => {
  const { authStatus } = useAuth();

  if (authStatus === 'loading') {
    return <div>Cargando...</div>;
  }

  if (authStatus === 'guest') {
    return <Navigate to="/login" replace />;
  }

  return <NotFound />;
};
