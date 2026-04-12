import { Outlet } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import "../styles/components/_privateLayout.scss"
import { Footer } from "@components/Footer";

export function PrivateLayout() {
	// Layout común para todas las páginas privadas (footer, header, chat...)
	// Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.
	// Hay que crear y modificar el header y footer dependiendo de la ruta, por ahora uso generico
	return (
		<div className="privateLayout">
			<aside className="privateLayout__leftPanel">
				LEFT PANEL
			</aside>

			<PrivHeader />

			<main className="privateLayout__content">
				<div className="privateLayout__contentFrame">
					<div className="privateLayout__contentInner">
					<Outlet />
					</div>
				</div>
			</main>

			<footer className="privateLayout__footer">
				<Footer/>
			</footer>

			<aside className="privateLayout__rightPanel">
				RIGHT PANEL
			</aside>

			<Footer />
		</div>
	);
}
