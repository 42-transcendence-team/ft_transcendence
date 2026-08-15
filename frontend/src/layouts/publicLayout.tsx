import { Footer } from "@components/Footer";
import { Outlet } from "react-router-dom";
import "../styles/components/_publicLayout.scss"

export function PublicLayout() {
	// Layout común para todas las páginas públicas (footer, header...)
	// Es en las páginas donde se modifica el body dependiendo de que se muestre en estas.
	return (
		<div className="public-layout">

			<main className="public-layout__content">
				<section className="auth-page">
					<Outlet />
				</section>
			</main>

			<Footer />
		</div>
	);
}
