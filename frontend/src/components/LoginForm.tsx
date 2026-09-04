import '@styles/_settingsSection.scss';

import { Login } from 'api/Login';
import { useState } from 'react';
import { FormField } from './FormField';

type FormErrors = {
  identifier: string;
  password: string;
};

export const LoginForm = ({ onSuccess, onRequires2FA }: any) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<FormErrors>({
    identifier: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      identifier: '',
      password: '',
    };

    if (!identifier.trim()) {
      newErrors.identifier =
        'Debes introducir el nombre de usuario o el correo electrónico.';
    }

    if (!password) {
      newErrors.password = 'Debes introducir la contraseña.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const data = await Login(identifier, password);

      if (!data) {
        setServerMessage('Error desconocido');
        return;
      }

      if (data.requires2fa) {
        onRequires2FA?.(data);
        return;
      }

      onSuccess?.(data);
    } catch (err: any) {
      setServerMessage(err?.message || 'No se ha podido iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <FormField
        type="text"
        id="identifier"
        label="Usuario o correo electrónico"
        value={identifier}
        onChange={setIdentifier}
        error={errors.identifier}
        className="form-field"
        placeholder="Usuario o correo electrónico"
      />

      <FormField
        id="password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        className="form-field"
        placeholder="Contraseña"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-form__submit"
      >
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      {serverMessage && (
        <p className="auth-form__server-message">{serverMessage}</p>
      )}
    </form>
  );
};
