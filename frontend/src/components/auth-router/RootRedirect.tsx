import { useAuth } from '@components/auth-router/AuthContext';
import { Navigate } from 'react-router-dom';

// Componente para redireccionar el "home-root", la barra (`/`),
// a `/app` en caso de estar autentificado o a `/login` en caso de
// no estarlo ("guest"). Usado en `frontend/src/router/router.tsx`
export const RootRedirect = () => {
  const { authStatus } = useAuth();

  if (authStatus === 'loading') {
    return <div>Cargando...</div>;
  }

  if (authStatus === 'auth') {
    return <Navigate to="/app" replace />;
  }

  return <Navigate to="/login" replace />;
};
