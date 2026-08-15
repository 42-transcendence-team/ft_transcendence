import { Modal } from "@components/Modal"
import logo from "../assets/icons/24_logo.png"
import { LoginForm } from "../components/LoginForm"
import "../styles/pages/_authPages.scss"
import { NavLink, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useRouterAuth } from "@components/auth-router/AuthContext";
import { useAuth as useUserAuth } from "../context/AuthContext";
import { Login2FA, getAuthenticatedUser } from "api/Login";
import { OtpInput } from "@components/TwoFactorUI";


export const Login = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [oauthError, setOauthError] = useState<string | null>(null);

	useEffect(() => {
		const error = searchParams.get("oauth_error");
		const requires2FA = searchParams.get("requires_2fa");

		if (error) {
			setOauthError(error);
			setSearchParams({});
		}
		if (requires2FA) {
			setShow2FA(true);
			setSearchParams({});
		}
	}, [searchParams, setSearchParams]);

	const handle42Login = () => {
		window.location.href = "https://localhost/api/v1/auth/42/login";
	};

	const handleModalClose = () => {
		setOauthError(null);
	};

	const navigate = useNavigate();
	const { refreshAuth } = useRouterAuth();
	const { refreshUser } = useUserAuth();

	const [show2FA, setShow2FA] = useState(false);
	const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));

	const handleSuccess = async (data: any) => {
		await refreshAuth();
		await refreshUser();

		if (data.user?.login) {
			navigate(`/app/profile/${data.user.login}`);
		} else {
			navigate("/app");
		}
	};

	const handleRequires2FA = () => {
		setShow2FA(true);
	};

	const handleVerify2FA = async () => {
		if (!otpCode.every((d) => d)) return;

		await Login2FA(otpCode.join(""));
		await refreshAuth();
		await refreshUser();

		const data = await getAuthenticatedUser();

		setShow2FA(false);

		const login = data.user?.login;
		if (login) {
			navigate(`/app/profile/${login}`);
			return;
		}

		navigate("/app");
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

				<LoginForm
					onSuccess={handleSuccess}
					onRequires2FA={handleRequires2FA}
				/>

				<p className="auth-form__switch">
					Don&apos;t have an account yet? <NavLink to="/register">Register</NavLink>
				</p>

				<Modal
					open={show2FA}
					title="2FA Verification"
					onClose={() => setShow2FA(false)}
					onSubmit={handleVerify2FA}
					submitDisabled={!otpCode.every((d) => d)}
				>
					<OtpInput onChange={setOtpCode} />
				</Modal>

				<h3 className="auth-form__divider">OR</h3>
					<button className="auth-card__button" onClick={handle42Login}>
						Login with 42
					</button>

			</div>
		</>
	);
};
