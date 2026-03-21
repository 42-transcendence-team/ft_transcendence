import { Outlet } from "react-router-dom";

import { PrivHeader } from "@components/PrivHeader";
import "../styles/components/_privateLayout.scss"

export function PrivateLayout() {
	// Layout común para todas las páginas privadas (footer, header, chat...)
	// Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.
	// Hay que crear y modificar el header y footer dependiendo de la ruta, por ahora uso generico
	return (
		<div className="privateLayout">
			<aside className="privateLayout__leftPanel">
				LEFT PANEL
			</aside>

			<header className="privateLayout__header">
				<PrivHeader />
			</header>

			<main className="privateLayout__content">
				<Outlet />
			</main>

			<footer className="privateLayout__footer">
				FOOTER
			</footer>

			<aside className="privateLayout__rightPanel">
				RIGHT PANEL
			</aside>
		</div>
	);
}
