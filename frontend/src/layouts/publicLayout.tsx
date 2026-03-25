
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { Outlet } from "react-router-dom";

export function PublicLayout() {
	// Layout común para todas las páginas públicas (footer, header...)
	// Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.
	return (
		<div>
			<Header />
			<Outlet />
			<Footer />
		</div>
	);
}