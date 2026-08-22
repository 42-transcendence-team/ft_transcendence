import { NavLink } from "react-router-dom";

import { useAuth } from "@components/auth-router/AuthContext";
import { AppBrand } from "@components/AppBrand";
import "../styles/components/_header.scss";

const publicLinks = [
	{ to: "/about", label: "About" },
	{ to: "/faq", label: "F.A.Q." },
	{ to: "/developers", label: "Developers" },
	{ to: "/contact", label: "Contact" },
];

export const Header = () => {
	const { authStatus } = useAuth();

	return (
		<header className="public-header">
			<AppBrand
				className="public-header__brand"
				logoSize="medium"
				textSize="medium"
				tone="dark"
				bold
			/>

			<nav
				className="public-header__nav"
				aria-label="Public navigation"
			>
				<ul className="public-header__list">
					{publicLinks.map((link) => (
						<li key={link.to}>
							<NavLink
								to={link.to}
								className={({ isActive }) =>
									[
										"public-header__link",
										isActive
											? "public-header__link--active"
											: "",
									]
										.filter(Boolean)
										.join(" ")
								}
							>
								{link.label}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			<div className="public-header__actions">
				{authStatus === "guest" && (
					<>
						<NavLink
							to="/login"
							className="public-header__action public-header__action--secondary"
						>
							Login
						</NavLink>

						<NavLink
							to="/register"
							className="public-header__action public-header__action--primary"
						>
							Register
						</NavLink>
					</>
				)}

				{authStatus === "auth" && (
					<NavLink
						to="/app"
						className="public-header__action public-header__action--primary"
					>
						Open app
					</NavLink>
				)}
			</div>
		</header>
	);
};
