import { AppBrand } from "@components/AppBrand";
import { LoginForm } from "../components/LoginForm";

import "../styles/pages/_authPages.scss";

export const Login = () => {
	return (
		<section className="auth-page">
			<div className="auth-card">
				<div className="auth-card__header">
					<AppBrand
						className="auth-card__brand"
						logoSize="medium"
						textSize="large"
						tone="dark"
						bold
					/>
				</div>

				<p className="auth-card__subtitle">
					Connect to your account and continue playing.
				</p>

				<LoginForm />
			</div>
		</section>
	);
};
