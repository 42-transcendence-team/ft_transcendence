import logo from "../assets/icons/24_logo.png"
import { LoginForm } from "../components/LoginForm"
import "../styles/pages/_authPages.scss"
import { NavLink } from "react-router-dom"

export const Login = () => {
	// TODO - Revisar si se puede sacar del form el modal de 2FA y simplemente revisar si existe la cookie de tempToken para verificarlo
	const handle42Login = () => {
		window.location.href = "https://localhost/api/v1/auth/42/login";
	};

	return (
		<section className="auth-page">
			<div className="auth-card">
				<div className="auth-card__header">
					<NavLink to="/login" className="auth-card__homeLink">
						<img className="auth-card__logo" src={logo} alt="Twenty Four logo" />
						<h1 className="auth-card__title">Twenty Four</h1>
					</NavLink>
				</div>

				<p className="auth-card__subtitle">
					Connect to your account and continue playing.
				</p>

				<LoginForm />
				<button className="auth-card__button" onClick={handle42Login}>
					Login with 42
				</button>
			</div>
		</section>
	)
}
