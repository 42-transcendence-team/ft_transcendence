
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { Outlet, useLocation } from "react-router-dom";

export function PublicLayout() {
	// Layout común para todas las páginas públicas (footer, header...)
	// Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.

	// Usado para evitar mostrar el contenido del Header en caso de estar en las páginas asignadas
	const location = useLocation()
	const hideOnThisPages = ["/login", "/register"]
	const noHeader = hideOnThisPages.includes(location.pathname)
	
	return (
		<div>
			{!noHeader && <Header />}
			<Outlet />
			<Footer />
		</div>
	);
}
