import { Navigate } from "react-router-dom";
import { useAuth } from "@components/auth-router/AuthContext";

// Componente para redireccionar el "home-root", la barra (`/`),
// a `/app` en caso de estar autentificado o a `/login` en caso de
// no estarlo ("guest"). Usado en `frontend/src/router/router.tsx`
export const RootRedirect = () => {
	const { authStatus } = useAuth();

	if (authStatus === "loading") {
		return <div>Loading...</div>;
	}

	if (authStatus === "auth") {
		return <Navigate to="/app" replace />;
	}

	return <Navigate to="/login" replace />;
};
