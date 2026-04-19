import { NavLink } from "react-router-dom"
import logo from "../assets/icons/24_logo.png"
import "../styles/components/_footer.scss"

export const Footer = () => {
	return (
		<div className="footer">
			<nav className="footer__nav">
				<ul className="footer__list">
					<li><NavLink to="/about">About</NavLink></li>
					<li><NavLink to="/cookies">Cookies</NavLink></li>
					<li><NavLink to="/faq">F.A.Q.</NavLink></li>
					<li><NavLink to="/contact">Contact</NavLink></li>
					<li><NavLink to="/developers">Developers</NavLink></li>
					<li><NavLink to="/privacy-policy">Privacy Policy</NavLink></li>
				</ul>
			</nav>

			<div className="footer__brand">
				<img src={logo} alt="Twenty Four logo" width="80" />
				<span>Twenty Four</span>
			</div>
		</div>
	)
}
