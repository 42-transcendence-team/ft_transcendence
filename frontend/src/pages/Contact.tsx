import {
	FiMail,
	FiMessageSquare,
	FiPhone,
	FiShield,
} from "react-icons/fi";

import { InformationalPageLayout } from "../components/information/InformationalPageLayout";

/*
 * Estos datos son genéricos de forma intencionada.
 * Sustitúyelos por los canales reales antes de publicar la aplicación.
 */
const contactMethods = [
	{
		title: "General enquiries",
		description:
			"Questions about the project, its features or the development team.",
		icon: FiMessageSquare,
		links: [
			{
				label: "contact@twentyfour.example",
				href: "mailto:contact@twentyfour.example",
				icon: FiMail,
			},
			{
				label: "+34 900 000 000",
				href: "tel:+34900000000",
				icon: FiPhone,
			},
		],
	},
	{
		title: "Privacy requests",
		description:
			"Questions about access, correction or deletion of personal information.",
		icon: FiShield,
		links: [
			{
				label: "privacy@twentyfour.example",
				href: "mailto:privacy@twentyfour.example",
				icon: FiMail,
			},
		],
	},
	{
		title: "Security reports",
		description:
			"Responsible disclosure of vulnerabilities or other security concerns.",
		icon: FiShield,
		links: [
			{
				label: "security@twentyfour.example",
				href: "mailto:security@twentyfour.example",
				icon: FiMail,
			},
		],
	},
];

export const Contact = () => {
	return (
		<InformationalPageLayout
			eyebrow="Support"
			title="Contact"
			subtitle="Get in touch with the Twenty Four team."
			className="information-page--contact"
		>
			<div className="contact-grid">
				{contactMethods.map((method) => {
					const MethodIcon = method.icon;

					return (
						<article
							className="contact-card"
							key={method.title}
						>
							<span className="contact-card__icon">
								<MethodIcon aria-hidden="true" />
							</span>

							<h2 className="contact-card__title">
								{method.title}
							</h2>

							<p className="contact-card__description">
								{method.description}
							</p>

							<div className="contact-card__links">
								{method.links.map((link) => {
									const LinkIcon = link.icon;

									return (
										<a
											key={link.href}
											href={link.href}
										>
											<LinkIcon aria-hidden="true" />
											{link.label}
										</a>
									);
								})}
							</div>
						</article>
					);
				})}
			</div>

			<div className="information-callout">
				<div>
					<h2>Student project support</h2>
					<p>
						Twenty Four is maintained by a student
						development team. Response times may vary.
					</p>
				</div>
			</div>
		</InformationalPageLayout>
	);
};
