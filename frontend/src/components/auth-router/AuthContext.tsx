// TODO: esto creo que no tiene que estar en components pero tampoco se donde meterlo

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

export type AuthStatus = 'loading' | 'auth' | 'guest';

type AuthContextType = {
  authStatus: AuthStatus;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  authStatus: AuthStatus;
  refreshAuth: () => Promise<void>;
  children: ReactNode;
};

export const AuthProvider = ({
  authStatus,
  refreshAuth,
  children,
}: AuthProviderProps) => {
  return (
    <AuthContext.Provider value={{ authStatus, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
