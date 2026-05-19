// App.tsx - Limpio
import './styles/App.scss';
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthProvider } from "@components/auth-router/AuthContext";
import { apiRequest } from 'api/ApiRequest';

type AuthStatus = "loading" | "auth" | "guest"
// loading -> aun no se si hay sesion activa
// auth -> usuario autenticado
// guest -> usuario no autenticado

const App = () => {

	const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
	// auth status -> es el estado actual del usuario
	// serAuthStatus -> es la funcion que cambia ese estado
	// useState<AuthStatus>("loading") -> crea el estado y lo inicia a loading

	// antes esta funcion se llamaba isAuthenticated()
	// se renombra a refreshAuth() porque ahora no solo comprueba al cargar la app,
	// sino que tambien la podremos reutilizar despues del login o del 2FA
	// una funcion es asincrona cuando hace una peticion http
	async function refreshAuth() {

		setAuthStatus("loading");

		try {
			await apiRequest({ endpoint: "auth/me" });
			setAuthStatus("auth");
		} catch (error) {
			// TODO: que pasa si falla?
			setAuthStatus("guest");
		}
	}

	useEffect(() => {
		// antes: isAuthenticated();
		// ahora llamamos a refreshAuth(), pero hace la misma comprobacion inicial
		refreshAuth();
	}, []);

	return (
		// antes el provider solo recibia authStatus
		// ahora tambien recibe refreshAuth para poder reutilizar esta comprobacion
		// desde otros componentes, por ejemplo LoginForm
		<AuthProvider authStatus={authStatus} refreshAuth={refreshAuth}>
			<div className="content">
				{/* esto era solo para depurar, mejor quitarlo del render final */}
				{/* <div>Estado auth: {authStatus}</div> */}
				<Outlet />
			</div>
		</AuthProvider>
	);
};
export default App;