import { Modal } from "@components/Modal"
import logo from "../assets/icons/24_logo.png"
import { LoginForm } from "../components/LoginForm"
import "../styles/pages/_authPages.scss"
import { NavLink, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react";


export const Login = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [oauthError, setOauthError] = useState<string | null>(null);

	useEffect(() => {
		const error = searchParams.get("oauth_error");

		if (error) {
			setOauthError(error);
			setSearchParams({});
		}
	}, [searchParams, setSearchParams]);

	const handle42Login = () => {
		window.location.href = "https://localhost/api/v1/auth/42/login";
	};

	const handleModalClose = () => {
		setOauthError(null);
	};

	return (
		<>
			{oauthError && (
				<Modal
					open={true}
					title="Login Failed"
					onClose={handleModalClose}
				>
					<p>
						Login with 42 failed: {oauthError}
					</p>
				</Modal>
			)}

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
				<h3 className="auth-form__divider">OR</h3>
					<button className="auth-card__button" onClick={handle42Login}>
						Login with 42
					</button>

			</div>
		</>
	);
};
