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
		title: "Create your profile",
		description:
			"Build your identity with a personal profile, avatar and banner.",
		icon: FiUser,
	},
	{
		title: "Connect with friends",
		description:
			"Send requests and maintain your own network of contacts.",
		icon: FiUsers,
	},
	{
		title: "Share posts and files",
		description:
			"Publish text, images and supported documents.",
		icon: FiFileText,
	},
	{
		title: "Join the conversation",
		description:
			"Comment on publications and react to shared content.",
		icon: FiMessageCircle,
	},
	{
		title: "Protect your account",
		description:
			"Manage your session, password and two-factor authentication.",
		icon: FiShield,
	},
	{
		title: "Use one connected space",
		description:
			"Access social and interactive features from the same application.",
		icon: FiActivity,
	},
];

const principles = [
	{
		title: "Usability",
		description:
			"Clear interfaces and predictable interactions.",
	},
	{
		title: "Security",
		description:
			"Account protection and controlled access to user data.",
	},
	{
		title: "Teamwork",
		description:
			"A shared project designed and built by five developers.",
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
