import { AppBrand } from "@components/AppBrand";
import { RegisterForm } from "../components/RegisterForm";

import "../styles/pages/_authPages.scss";

export const Register = () => {
	return (
		<section className="auth-page auth-page--register">
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
					New in Twenty Four? Create your free account now!
				</p>

				<RegisterForm />
			</div>
		</section>
	);
};
