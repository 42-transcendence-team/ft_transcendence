import { Outlet } from "react-router-dom";

import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

export function PrivateLayout() {
	// Layout común para todas las páginas privadas (footer, header, chat...)
	// Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.
	// Hay que crear y modificar el header y footer dependiendo de la ruta, por ahora uso generico
	return (
		<div>
			<Header />
			<Outlet />
			<Footer />
		</div>
	);
}
