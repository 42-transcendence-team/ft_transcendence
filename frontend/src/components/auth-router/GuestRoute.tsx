import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@components/auth-router/AuthContext";

type GuestRouteProps = {
  children: ReactNode;
};

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const { authStatus } = useAuth();

  if (authStatus === "loading") {
    return <div>Cargando...</div>;
  }

  if (authStatus === "auth") {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};