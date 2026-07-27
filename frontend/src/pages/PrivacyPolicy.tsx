import {
	FiAlertCircle,
	FiDatabase,
	FiLock,
	FiShield,
} from "react-icons/fi";

import { InformationalPageLayout } from "../components/information/InformationalPageLayout";
import { InformationSection } from "../components/information/InformationSection";

const informationCategories = [
	{
		title: "Account information",
		items: [
			"Username",
			"Email address",
			"Name and surname",
			"Date of birth",
			"Password hash",
			"Two-factor authentication configuration",
		],
	},
	{
		title: "Profile information",
		items: [
			"Avatar and banner",
			"Status message",
			"Online status",
			"Profile visit counter",
		],
	},
	{
		title: "User-generated content",
		items: [
			"Posts",
			"Uploaded images and PDF files",
			"Comments",
			"Likes and dislikes",
		],
	},
	{
		title: "Social information",
		items: [
			"Friend requests",
			"Friendships",
			"Blocked users",
		],
	},
];

const purposes = [
	"Create and manage user accounts.",
	"Authenticate users and maintain secure sessions.",
	"Provide profiles, friendships and social features.",
	"Store and display user-generated content.",
	"Enable two-factor authentication and account controls.",
	"Maintain application stability and investigate technical incidents.",
];

const securityMeasures = [
	"Passwords hashed with bcrypt.",
	"HttpOnly authentication cookies.",
	"SameSite cookie protection.",
	"Secure cookies in production.",
	"Optional TOTP two-factor authentication.",
	"Server-side session validation.",
	"Restricted upload types and file sizes.",
	"Content-based MIME validation for uploaded files.",
];

export const PrivacyPolicy = () => {
	return (
		<InformationalPageLayout
			eyebrow="Legal"
			title="Privacy Policy"
			subtitle="How Twenty Four collects, uses and protects personal information."
			className="information-page--privacy"
		>
			<div className="information-callout information-callout--warning">
				<FiAlertCircle aria-hidden="true" />

				<div>
					<h2>Current project implementation</h2>
					<p>
						This notice describes the current behaviour of
						Twenty Four. Contact details and retention rules
						must be reviewed before a public production release.
					</p>
				</div>
			</div>

			<InformationSection title="1. Who is responsible?">
				<div className="information-contact">
					<p>
						<strong>Twenty Four development team</strong>
					</p>

					<a href="mailto:privacy@twentyfour.example">
						privacy@twentyfour.example
					</a>

					<a href="tel:+34900000000">
						+34 900 000 000
					</a>
				</div>
			</InformationSection>

			<InformationSection title="2. Information we collect">
				<div className="privacy-grid">
					{informationCategories.map((category) => (
						<article
							className="privacy-card"
							key={category.title}
						>
							<h3>{category.title}</h3>

							<ul className="information-list">
								{category.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</article>
					))}
				</div>

				<div className="information-inline information-inline--spaced">
					<FiDatabase aria-hidden="true" />

					<p>
						Technical logs, authentication events and
						operational metrics may also be processed when
						the corresponding monitoring services are enabled.
					</p>
				</div>
			</InformationSection>

			<InformationSection title="3. Why we use this information">
				<ul className="information-list information-list--checks">
					{purposes.map((purpose) => (
						<li key={purpose}>{purpose}</li>
					))}
				</ul>
			</InformationSection>

			<InformationSection title="4. Information visible to other users">
				<p>
					Authenticated users may see information exposed by
					your profile and activity, including your username,
					name, avatar, banner, status, posts, comments and
					reactions.
				</p>

				<p>
					Your password, password hash, email address and
					two-factor authentication credentials are not
					public profile information.
				</p>
			</InformationSection>

			<InformationSection title="5. Where information is stored">
				<div className="information-grid information-grid--two">
					<article className="information-card">
						<h3 className="information-card__title">
							PostgreSQL
						</h3>
						<p className="information-card__text">
							Account data, content and user relationships.
						</p>
					</article>

					<article className="information-card">
						<h3 className="information-card__title">
							Redis
						</h3>
						<p className="information-card__text">
							Sessions, temporary authentication data,
							online state and temporary counters.
						</p>
					</article>

					<article className="information-card">
						<h3 className="information-card__title">
							Persistent uploads
						</h3>
						<p className="information-card__text">
							Avatars, banners and files attached to posts.
						</p>
					</article>

					<article className="information-card">
						<h3 className="information-card__title">
							Monitoring services
						</h3>
						<p className="information-card__text">
							Application logs and operational metrics when
							monitoring is enabled.
						</p>
					</article>
				</div>
			</InformationSection>

			<InformationSection title="6. Security">
				<div className="information-inline">
					<FiLock aria-hidden="true" />

					<p>
						Twenty Four applies technical measures intended
						to protect accounts and uploaded information.
					</p>
				</div>

				<ul className="information-list information-list--checks">
					{securityMeasures.map((measure) => (
						<li key={measure}>{measure}</li>
					))}
				</ul>

				<p className="information-note">
					No online service can guarantee absolute security.
				</p>
			</InformationSection>

			<InformationSection title="7. Retention and account deletion">
				<p>
					Users can request account deletion from the account
					settings. Password confirmation and, when enabled,
					a two-factor authentication code are required.
				</p>

				<p>
					The final production policy must confirm how related
					content, uploaded files, operational logs and backups
					are retained or removed. This notice does not claim
					that every related record is immediately erased.
				</p>
			</InformationSection>

			<InformationSection title="8. Your rights">
				<p>
					Depending on the applicable law, users may request
					access, correction or deletion of their personal
					information, as well as restriction, objection or
					portability where applicable.
				</p>

				<p>
					Requests can be sent to{" "}
					<a href="mailto:privacy@twentyfour.example">
						privacy@twentyfour.example
					</a>.
				</p>
			</InformationSection>

			<InformationSection title="9. Age requirement">
				<p>
					Twenty Four is intended for users aged 18 or older.
				</p>
			</InformationSection>

			<InformationSection title="10. Third parties">
				<div className="information-inline">
					<FiShield aria-hidden="true" />

					<p>
						Twenty Four does not currently include advertising
						networks, social tracking pixels or external
						analytics platforms.
					</p>
				</div>
			</InformationSection>

			<InformationSection title="11. Changes to this policy">
				<p>
					This policy may be updated when the application,
					its infrastructure or its data-processing practices
					change.
				</p>

				<p className="information-meta">
					Last updated: July 2026
				</p>
			</InformationSection>
		</InformationalPageLayout>
	);
};
