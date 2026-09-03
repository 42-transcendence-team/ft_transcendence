import { FiExternalLink } from "react-icons/fi";

import { developers } from "../assets/data/developers";
import { DeveloperCard } from "../components/information/DeveloperCard";
import { InformationalPageLayout } from "../components/information/InformationalPageLayout";
import { InformationSection } from "../components/information/InformationSection";

const technologies = [
	{
		name: "React",
		url: "https://react.dev/",
	},
	{
		name: "TypeScript",
		url: "https://www.typescriptlang.org/",
	},
	{
		name: "Go",
		url: "https://go.dev/",
	},
	{
		name: "Gin",
		url: "https://gin-gonic.com/",
	},
	{
		name: "PostgreSQL",
		url: "https://www.postgresql.org/",
	},
	{
		name: "Redis",
		url: "https://redis.io/",
	},
	{
		name: "Docker",
		url: "https://www.docker.com/",
	},
	{
		name: "Nginx",
		url: "https://nginx.org/",
	},
];

export const Developers = () => {
	return (
		<InformationalPageLayout
			eyebrow="Equipo"
			title="Equipo de desarrollo"
			subtitle="Cinco desarrolladores trabajando juntos en Twenty Four."
			className="information-page--developers"
		>
			<div className="developers-grid">
				{developers.map((developer) => (
					<DeveloperCard
						key={developer.id}
						{...developer}
					/>
				))}
			</div>

			<InformationSection title="Tecnologías utilizadas">
				<ul
					className="technology-list"
					aria-label="Tecnologías principales"
				>
					{technologies.map((technology) => (
						<li key={technology.name}>
							<a
								href={technology.url}
								target="_blank"
								rel="noreferrer"
								aria-label={`Abrir el sitio web oficial de ${technology.name}`}
							>
								<span>{technology.name}</span>

								{/*
								 * El icono deja claro que el enlace abre
								 * una web externa en una pestaña nueva.
								 */}
								<FiExternalLink aria-hidden="true" />
							</a>
						</li>
					))}
				</ul>
			</InformationSection>
		</InformationalPageLayout>
	);
};
