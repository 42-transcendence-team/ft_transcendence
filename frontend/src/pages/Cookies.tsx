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
			"Keeps the user authenticated after a successful login.",
		duration:
			"Until the configured session expiration or logout.",
	},
	{
		name: "tempToken",
		purpose:
			"Temporarily identifies a login attempt while two-factor authentication is completed.",
		duration:
			"Approximately five minutes or until the verification process is completed.",
	},
];

export const Cookies = () => {
	return (
		<InformationalPageLayout
			eyebrow="Legal"
			title="Cookie Policy"
			subtitle="How Twenty Four uses essential cookies to keep your account secure."
			className="information-page--cookies"
		>
			<div className="information-callout information-callout--positive">
				<FiShield aria-hidden="true" />

				<div>
					<h2>Essential cookies only</h2>
					<p>
						Twenty Four currently uses cookies required
						for authentication and account security. It
						does not use advertising or analytics cookies.
					</p>
				</div>
			</div>

			<InformationSection title="Cookies used by Twenty Four">
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
									Strictly necessary
								</span>
							</header>

							<dl className="cookie-card__details">
								<div>
									<dt>Purpose</dt>
									<dd>{cookie.purpose}</dd>
								</div>

								<div>
									<dt>Browser access</dt>
									<dd>
										HttpOnly. Client-side JavaScript
										cannot read its value.
									</dd>
								</div>

								<div>
									<dt>Security</dt>
									<dd>
										SameSite=Lax and Secure when the
										application runs in production.
									</dd>
								</div>

								<div>
									<dt>Duration</dt>
									<dd>{cookie.duration}</dd>
								</div>
							</dl>
						</article>
					))}
				</div>
			</InformationSection>

			<InformationSection title="Server-side session data">
				<div className="information-inline">
					<FiServer aria-hidden="true" />

					<p>
						Session identifiers, temporary authentication
						information and online status may also be stored
						on the server. This information is not stored as
						an additional browser cookie.
					</p>
				</div>
			</InformationSection>

			<InformationSection title="Managing cookies">
				<div className="information-inline">
					<FiClock aria-hidden="true" />

					<p>
						Blocking essential cookies will prevent login
						and other authenticated features from working
						correctly.
					</p>
				</div>
			</InformationSection>

			<InformationSection title="Policy changes">
				<p>
					This page will be updated if Twenty Four adds
					optional cookies, external analytics or other
					tracking technologies.
				</p>
			</InformationSection>
		</InformationalPageLayout>
	);
};
