import { AppBrand } from '@components/AppBrand';
import { RegisterForm } from '../components/RegisterForm';

import '../styles/pages/_authPages.scss';

export const Register = () => {
  return (
    <>
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
          ¿Eres nuevo en Twenty Four? Crea ya tu cuenta gratuita.
        </p>

        <RegisterForm />
      </div>
    </>
  );
};
