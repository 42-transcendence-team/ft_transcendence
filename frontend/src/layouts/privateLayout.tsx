import "../styles/components/_privateLayout.scss"
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "@components/Footer";
import { PrivHeader } from "@components/PrivHeader";
import { WebSocketProvider } from "context/webSocketContext";

export function PrivateLayout() {
	const data = useLoaderData();

	return (
		<div className="privateLayout">
			<WebSocketProvider user={data.user}>
				<header className="privateLayout__header">
					<PrivHeader />
				</header>

				<aside className="privateLayout__leftPanel">
					<div className="leftPanel__content">
						<div className="leftPanel__actions">
						</div>
					</div>
				</aside>

				<main className="privateLayout__content">
					<div className="privateLayout__contentFrame">
						<div className="privateLayout__contentInner">
							<Outlet />
						</div>
					</div>
				</main>

				<footer className="privateLayout__footer">
					<Footer />
				</footer>
			</WebSocketProvider>
		</div>
	);
}
