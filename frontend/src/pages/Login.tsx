import logo from "../assets/icons/24_logo.png"
import { LoginForm } from "../components/LoginForm"
import "../styles/pages/_authPages.scss"

export const Login = () => {
	return (
		<section className="auth-page">
			<div className="auth-card">
				<div className="auth-card__header">
					<img className="auth-card__logo" src={logo} alt="Twenty Four logo" />
					<h1 className="auth-card__title">Twenty Four</h1>
				</div>

				<p className="auth-card__subtitle">
					Connect to your account and continue playing.
				</p>

				<LoginForm />
			</div>
		</section>
	)
}
