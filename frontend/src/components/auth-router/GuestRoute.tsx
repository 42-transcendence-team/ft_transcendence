import { useAuth } from '@components/auth-router/AuthContext';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type GuestRouteProps = {
  children: ReactNode;
};

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { authStatus } = useAuth();

  if (authStatus === 'loading') {
    return <div>Cargando...</div>;
  }

  if (authStatus === 'auth') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
