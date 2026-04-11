import { NavLink } from "react-router-dom"
import logo from "../assets/icons/24_logo.png"
import { RegisterForm } from "../components/RegisterForm"
import "../styles/pages/_authPages.scss"

export const Register = () => {
	return (
		<section className="auth-page auth-page--register">
			<div className="auth-card">
				<div className="auth-card__header">
					<NavLink to="/login" className="auth-card__homeLink">
						<img className="auth-card__logo" src={logo} alt="Twenty Four logo" />
						<h1 className="auth-card__title">Twenty Four</h1>
					</NavLink>
				</div>

				<p className="auth-card__subtitle">
					New in Twenty Four? Create your free account now!
				</p>

				<RegisterForm />
			</div>
		</section>
	)
}
