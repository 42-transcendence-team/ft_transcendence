import { AppBrand } from '@components/AppBrand';
import { useAuth as useRouterAuth } from '@components/auth-router/AuthContext';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { get42UserInfo, register42User } from '../api/Register';
import { FormField } from '../components/FormField';
import { useAuth as useUserAuth } from '../context/AuthContext';
import { calculateAge } from '../utils/calculateAge';

type FormFields = {
  login: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  birthday: string;
};

type FormErrors = Record<
  keyof Omit<FormFields, 'termsAndConditions' | 'privacyPolicy'>,
  string
>;

const INITIAL_FORM_STATE: FormFields = {
  login: '',
  email: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
  birthday: '',
};

const INITIAL_ERRORS: FormErrors = {
  login: '',
  email: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
  birthday: '',
};

export default function Register42() {
  const [formData, setFormData] = useState<FormFields>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);
  const [serverMessage, setServerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { refreshAuth } = useRouterAuth();
  const { refreshUser } = useUserAuth();

  const validateForm = (): boolean => {
    const newErrors = { ...INITIAL_ERRORS };
    const MAX_LENGTH = 42;

    const regex = {
      username: /^[A-Za-z0-9_-]+$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      name: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s-]+$/,
      password: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/,
    };

    if (!formData.login.trim()) {
      newErrors.login = 'Debes introducir un nombre de usuario.';
    } else if (!regex.username.test(formData.login)) {
      newErrors.login =
        'Solo se permiten letras, números, guiones y guiones bajos.';
    } else if (formData.login.length > MAX_LENGTH) {
      newErrors.login = `La longitud máxima es de ${MAX_LENGTH} caracteres.`;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Debes introducir el correo electrónico.';
    } else if (!regex.email.test(formData.email)) {
      newErrors.email = 'Introduce una dirección de correo electrónico válida.';
    }

    if (!formData.password) {
      newErrors.password = 'Debes introducir una contraseña.';
    } else if (!regex.password.test(formData.password)) {
      newErrors.password =
        'La contraseña debe tener entre 8 y 64 caracteres e incluir al menos una mayúscula, un número y un símbolo.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    (['first_name', 'last_name'] as const).forEach((field) => {
      const val = formData[field].trim();
      if (!val) {
        newErrors[field] = 'Este campo es obligatorio.';
      } else if (!regex.name.test(val)) {
        newErrors[field] = 'Este campo solo puede contener letras.';
      } else if (val.length > MAX_LENGTH) {
        newErrors[field] = `La longitud máxima es de ${MAX_LENGTH} caracteres.`;
      }
    });

    if (!formData.birthday) {
      newErrors.birthday = 'Debes introducir la fecha de nacimiento.';
    } else {
      const birthDate = new Date(formData.birthday);
      if (Number.isNaN(birthDate.getTime())) {
        newErrors.birthday = 'Introduce una fecha de nacimiento válida.';
      } else {
        const age = calculateAge(formData.birthday);
        if (age < 18)
          newErrors.birthday = 'Debes tener al menos 18 años para registrarte.';
        else if (age > 150)
          newErrors.birthday = 'La edad no puede superar los 150 años.';
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setServerMessage('');

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await register42User(formData);
      setServerMessage('La cuenta se ha creado correctamente.');
      await refreshAuth();
      await refreshUser();
      navigate('/app');
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const apiError = error as { status: number };

        if (apiError.status === 400) {
          setServerMessage('La solicitud no es válida.');
          return;
        }

        if (apiError.status === 422) {
          setServerMessage(
            'Algunos campos no son válidos. Revisa el formulario.',
          );
          return;
        }

        if (apiError.status === 409) {
          setServerMessage(
            'El nombre de usuario o el correo electrónico ya están registrados.',
          );
          return;
        }
      }
      setServerMessage('Se ha producido un error. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    get42UserInfo()
      .then((data) => {
        setFormData((prev) => ({
          ...prev,
          login: data.login ?? '',
          email: data.email ?? '',
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
        }));
      })
      .catch(() => {
        setServerMessage(
          'No se ha podido obtener la información del usuario de 42.',
        );
      });
  }, []);

  const accountFields = [
    {
      id: 'login',
      label: 'Nombre de usuario',
      type: 'text',
      placeholder: 'Nombre de usuario',
    },
    {
      id: 'email',
      label: 'Correo electrónico',
      type: 'email',
      placeholder: 'Correo electrónico',
    },
    {
      id: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: 'Contraseña',
    },
    {
      id: 'confirmPassword',
      label: 'Confirmar contraseña',
      type: 'password',
      placeholder: 'Repite la contraseña',
    },
  ];

  const personalFields = [
    { id: 'first_name', label: 'Nombre', type: 'text', placeholder: 'Nombre' },
    {
      id: 'last_name',
      label: 'Apellidos',
      type: 'text',
      placeholder: 'Apellidos',
    },
    {
      id: 'birthday',
      label: 'Fecha de nacimiento',
      type: 'date',
      placeholder: '',
    },
  ];

  return (
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
      <form className="auth-form" onSubmit={handleSubmit}>
        <h3 className="auth-form__section-title">DATOS DE LA CUENTA</h3>
        <div className="auth-form__group">
          {accountFields.map((field) => (
            <FormField
              key={field.id}
              id={field.id}
              name={field.id}
              label={field.label}
              type={field.type}
              className="form-field"
              value={formData[field.id as keyof FormFields] as string}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, [field.id]: value }));
              }}
              error={errors[field.id as keyof FormErrors]}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        <h3 className="auth-form__section-title">DATOS PERSONALES</h3>
        <div className="auth-form__group auth-form__group--personal">
          {personalFields.map((field) => (
            <FormField
              key={field.id}
              id={field.id}
              name={field.id}
              label={field.label}
              type={field.type}
              className="form-field"
              value={formData[field.id as keyof FormFields] as string}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, [field.id]: value }));
              }}
              error={errors[field.id as keyof FormErrors]}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        <p className="auth-form__info">
          Al countinuar, aceptas los{' '}
          <NavLink to="/terms">Terminos y Condiciones</NavLink> y la{' '}
          <NavLink to="/privacy-policy">Política de Privacidad</NavLink>.
        </p>
        <button
          className="auth-form__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        {serverMessage && (
          <p className="auth-form__server-message">{serverMessage}</p>
        )}
      </form>
    </div>
  );
}
