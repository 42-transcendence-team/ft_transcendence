import {
	FiClock,
	FiServer,
	FiShield,
} from "react-icons/fi";

import { InformationalPageLayout } from "../components/information/InformationalPageLayout";
import { InformationSection } from "../components/information/InformationSection";

const cookies = [
	{
		name: "jwt",
		purpose:
			"Mantiene la sesión del usuario iniciada después de identificarse correctamente.",
		duration:
			"Hasta que caduque la sesión configurada o el usuario cierre sesión.",
	},
	{
		name: "tempToken",
		purpose:
			"Identifica temporalmente un intento de inicio de sesión mientras se completa la autenticación en dos pasos.",
		duration:
			"Aproximadamente cinco minutos o hasta que finalice el proceso de verificación.",
	},
];

export const Cookies = () => {
	return (
		<InformationalPageLayout
			eyebrow="Información legal"
			title="Política de cookies"
			subtitle="Cómo utiliza Twenty Four las cookies esenciales para proteger tu cuenta."
			className="information-page--cookies"
		>
			<div className="information-callout information-callout--positive">
				<FiShield aria-hidden="true" />

				<div>
					<h2>Solo utilizamos cookies esenciales</h2>
					<p>
						Twenty Four utiliza actualmente las cookies necesarias
						para la autenticación y la seguridad de las cuentas. No
						utiliza cookies publicitarias ni de análisis.
					</p>
				</div>
			</div>

			<InformationSection title="Cookies utilizadas por Twenty Four">
				<div className="cookie-grid">
					{cookies.map((cookie) => (
						<article
							className="cookie-card"
							key={cookie.name}
						>
							<header className="cookie-card__header">
								<code className="cookie-card__name">
									{cookie.name}
								</code>

								<span className="cookie-card__badge">
									Estrictamente necesaria
								</span>
							</header>

							<dl className="cookie-card__details">
								<div>
									<dt>Finalidad</dt>
									<dd>{cookie.purpose}</dd>
								</div>

								<div>
									<dt>Acceso desde el navegador</dt>
									<dd>
										HttpOnly. El código JavaScript del cliente
										no puede leer su contenido.
									</dd>
								</div>

								<div>
									<dt>Seguridad</dt>
									<dd>
										SameSite=Lax y Secure cuando la
										aplicación se ejecuta en producción.
									</dd>
								</div>

								<div>
									<dt>Duración</dt>
									<dd>{cookie.duration}</dd>
								</div>
							</dl>
						</article>
					))}
				</div>
			</InformationSection>

			<InformationSection title="Datos de sesión almacenados en el servidor">
				<div className="information-inline">
					<FiServer aria-hidden="true" />

					<p>
						Los identificadores de sesión, la información temporal de autenticación
						y el estado de conexión también pueden almacenarse
						en el servidor. Esta información no se guarda como
						una cookie adicional en el navegador.
					</p>
				</div>
			</InformationSection>

			<InformationSection title="Gestión de las cookies">
				<div className="information-inline">
					<FiClock aria-hidden="true" />

					<p>
						Bloquear las cookies esenciales impedirá iniciar sesión
						y hará que otras funciones que requieren autenticación no funcionen
						correctamente.
					</p>
				</div>
			</InformationSection>

			<InformationSection title="Cambios en esta política">
				<p>
					Esta página se actualizará si Twenty Four incorpora
					cookies opcionales, servicios externos de análisis u otras
					tecnologías de seguimiento.
				</p>
			</InformationSection>
		</InformationalPageLayout>
	);
};
