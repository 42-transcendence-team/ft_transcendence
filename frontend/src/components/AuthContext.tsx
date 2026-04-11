import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type AuthStatus = "loading" | "auth" | "guest";

type AuthContextType = {
  authStatus: AuthStatus;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  authStatus: AuthStatus;
  children: ReactNode;
};

export const AuthProvider = ({ authStatus, children }: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={{ authStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};