import { NavLink } from "react-router-dom";

import { AppBrand } from "@components/AppBrand";
import "../styles/components/_footer.scss";

type FooterProps = {
	onBrandActivate?: () => void;
};

export const Footer = ({
	onBrandActivate,
}: FooterProps) => {
	return (
		<div className="footer desktop-footer">
			<nav
				className="footer__nav"
				aria-label="Footer navigation"
			>
				<ul className="footer__list">
					<li>
						<NavLink to="/about">
							About
						</NavLink>
					</li>

					<li>
						<NavLink to="/cookies">
							Cookies
						</NavLink>
					</li>

					<li>
						<NavLink to="/faq">
							F.A.Q.
						</NavLink>
					</li>

					<li>
						<NavLink to="/contact">
							Contact
						</NavLink>
					</li>

					<li>
						<NavLink to="/developers">
							Developers
						</NavLink>
					</li>

					<li>
						<NavLink to="/privacy-policy">
							Privacy Policy
						</NavLink>
					</li>
				</ul>
			</nav>

			<AppBrand
				className="footer__brand"
				logoSize="small"
				textSize="small"
				tone="light"
				bold
				onActivate={onBrandActivate}
			/>
		</div>
	);
};
