import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@components/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { authStatus } = useAuth();

  if (authStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (authStatus === "guest") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};