import './styles/App.scss';

import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "@components/AuthContext";

type AuthStatus = "loading" | "auth" | "guest"
// loading -> aun no se si hay sesion activa
// auth -> usuario autenticado
// guest -> usuario no autenticado

const App = () => {

  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  // auth status -> es el estado actual del usuario
  // serAuthStatus -> es la funcion que cambia ese estado
  // useState<AuthStatus>("loading") -> crea el estado y lo inicia a loading
  
  // una funcion es asincrona cuando hace una eticion http
  async function isAuthenticated() {
  
    setAuthStatus("loading");
  
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/me", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setAuthStatus("auth")
        return;
      }
      setAuthStatus("guest")
    } catch (error) {
      // TODO: que pasa si falla?
      setAuthStatus("guest")
    }
  
  }
  
  useEffect(() => {
    isAuthenticated();
  }, []);

  return (
    <AuthProvider authStatus={authStatus}>
      <div className="content">
        <div>Estado auth: {authStatus}</div>
        <Outlet />
      </div>
    </AuthProvider>
  );
};


export default App;



