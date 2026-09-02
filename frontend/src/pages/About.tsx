import { NavLink } from "react-router-dom";
import {
	FiActivity,
	FiArrowRight,
	FiFileText,
	FiMessageCircle,
	FiShield,
	FiUser,
	FiUsers,
} from "react-icons/fi";

import { InformationalPageLayout } from "../components/information/InformationalPageLayout";
import { InformationSection } from "../components/information/InformationSection";

const capabilities = [
	{
		title: "Crea tu perfil",
		description:
			"Construye tu identidad con un perfil personal, avatar y banner.",
		icon: FiUser,
	},
	{
		title: "Conecta con amigos",
		description:
			"Envía solicitudes y mantén tu propia red de contactos.",
		icon: FiUsers,
	},
	{
		title: "Comparte publicaciones y archivos",
		description:
			"Publica texto, imágenes y documentos compatibles.",
		icon: FiFileText,
	},
	{
		title: "Únete a la conversación",
		description:
			"Comenta las publicaciones y reacciona al contenido compartido.",
		icon: FiMessageCircle,
	},
	{
		title: "Protege tu cuenta",
		description:
			"Gestiona tu sesión, tu contraseña y la autenticación de dos factores.",
		icon: FiShield,
	},
	{
		title: "Usa un espacio conectado",
		description:
			"Accede a las funciones sociales e interactivas desde la misma aplicación.",
		icon: FiActivity,
	},
];

const principles = [
	{
		title: "Usabilidad",
		description:
			"Interfaces claras e interacciones predecibles.",
	},
	{
		title: "Seguridad",
		description:
			"Protección de la cuenta y acceso controlado a los datos de los usuarios.",
	},
	{
		title: "Trabajo en equipo",
		description:
			"Un proyecto compartido diseñado y construido por cinco desarrolladores.",
	},
];

export const About = () => {
	return (
		<InformationalPageLayout
			eyebrow="Twenty Four"
			title="About Twenty Four"
			subtitle="A social platform built to connect, share and interact."
			className="information-page--about"
		>
			<InformationSection title="What is Twenty Four?">
				<p>
					Twenty Four is a social web platform where
					users can create a profile, connect with other
					people and share content in a single space.
				</p>
			</InformationSection>

			<InformationSection title="What can you do?">
				<div className="information-grid information-grid--three">
					{capabilities.map((capability) => {
						const Icon = capability.icon;

						return (
							<article
								className="information-card"
								key={capability.title}
							>
								<span className="information-card__icon">
									<Icon aria-hidden="true" />
								</span>

								<h3 className="information-card__title">
									{capability.title}
								</h3>

								<p className="information-card__text">
									{capability.description}
								</p>
							</article>
						);
					})}
				</div>
			</InformationSection>

			<InformationSection title="Built as a team project">
				<p>
					Twenty Four was created by a team of five
					developers as part of the 42 Common Core final
					project.
				</p>
			</InformationSection>

			<InformationSection title="Our approach">
				<div className="information-grid information-grid--three">
					{principles.map((principle) => (
						<article
							className="information-card information-card--compact"
							key={principle.title}
						>
							<h3 className="information-card__title">
								{principle.title}
							</h3>

							<p className="information-card__text">
								{principle.description}
							</p>
						</article>
					))}
				</div>
			</InformationSection>

			<div className="information-callout information-callout--action">
				<div>
					<h2>Meet the people behind the project</h2>
					<p>
						Learn more about the team that designed and
						developed Twenty Four.
					</p>
				</div>

				<NavLink
					className="information-button"
					to="/developers"
				>
					Meet the team
					<FiArrowRight aria-hidden="true" />
				</NavLink>
			</div>
		</InformationalPageLayout>
	);
};
