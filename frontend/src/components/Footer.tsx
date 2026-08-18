import { NavLink } from "react-router-dom"
import { useAuth } from "@components/auth-router/AuthContext"
import logo from "../assets/icons/24_logo.png"
import "../styles/components/_footer.scss"

export const Footer = () => {
	const { authStatus } = useAuth()
	const brandTarget = authStatus === "auth" ? "/app" : "/login"

	return (
		<>
			{/* FOOTER DE ESCRITORIO (Se oculta en móvil) */}
			<div className="footer desktop-footer">
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

				<NavLink to={brandTarget} className="footer__brand">
					<img src={logo} alt="Twenty Four logo" width="80" />
					<span>Twenty Four</span>
				</NavLink>
			</div>
		</>
	)
}