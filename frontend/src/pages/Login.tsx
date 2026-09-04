import { AppBrand } from '@components/AppBrand';
import { Modal } from '@components/Modal';
import { LoginForm } from '../components/LoginForm';
import '../styles/pages/_authPages.scss';
import { useAuth as useRouterAuth } from '@components/auth-router/AuthContext';
import { OtpInput } from '@components/TwoFactorUI';
import { getAuthenticatedUser, Login2FA } from 'api/Login';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth as useUserAuth } from '../context/AuthContext';

export const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('oauth_error');
    const requires2FA = searchParams.get('requires_2fa');

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
    window.location.href = `${window.location.origin}/api/v1/auth/42/login`;
  };

  const handleModalClose = () => {
    setOauthError(null);
  };

  const navigate = useNavigate();
  const { refreshAuth } = useRouterAuth();
  const { refreshUser } = useUserAuth();

  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));

  const handleSuccess = async (data: any) => {
    await refreshAuth();
    await refreshUser();

    if (data.user?.login) {
      navigate(`/app/profile/${data.user.login}`);
    } else {
      navigate('/app');
    }
  };

  const handleRequires2FA = () => {
    setShow2FA(true);
  };

  const handleVerify2FA = async () => {
    if (!otpCode.every((d) => d)) return;

    await Login2FA(otpCode.join(''));
    await refreshAuth();
    await refreshUser();

    const data = await getAuthenticatedUser();

    setShow2FA(false);

    const login = data.user?.login;
    if (login) {
      navigate(`/app/profile/${login}`);
      return;
    }

    navigate('/app');
  };

  return (
    <>
      {oauthError && (
        <Modal
          open={true}
          title="Error al iniciar sesión"
          onClose={handleModalClose}
        >
          <p>No se ha podido iniciar sesión con 42: {oauthError}</p>
        </Modal>
      )}

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
          Accede a tu cuenta y sigue jugando.
        </p>

        <LoginForm
          onSuccess={handleSuccess}
          onRequires2FA={handleRequires2FA}
        />

        <p className="auth-form__switch">
          ¿Todavía no tienes una cuenta?{' '}
          <NavLink to="/register">Regístrate</NavLink>
        </p>

        <Modal
          open={show2FA}
          title="Verificación en dos pasos"
          onClose={() => setShow2FA(false)}
          onSubmit={handleVerify2FA}
          submitDisabled={!otpCode.every((d) => d)}
        >
          <OtpInput onChange={setOtpCode} />
        </Modal>

        <h3 className="auth-form__divider">O</h3>
        <button className="auth-card__button" onClick={handle42Login}>
          Iniciar sesión con 42
        </button>
      </div>
    </>
  );
};
