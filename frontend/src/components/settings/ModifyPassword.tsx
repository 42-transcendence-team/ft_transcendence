import '@styles/_settingsSection.scss';
import { useFormErrors } from '@hooks/useFormErrors';
import { type PasswordSettings, updatePassword } from 'api/Settings';
import type React from 'react';
import { Fragment, useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiLock, FiShield } from 'react-icons/fi';
import { FormField } from '../FormField';
import { Modal } from '../Modal';
import { Footer2FA, OtpInput } from '../TwoFactorUI';

type SettingsFields = {
  previous_password: string;
  password: string;
  verify_password: string;
};

// TODO - Pensar como mover cosas a Hook comun para evitar repetir codigo en los 3 componentes de modificacion de datos, email y password
// TODO - Aplicar estilos al formulario

const inputsConfig: Array<{
  id: keyof SettingsFields;
  label: string;
  type: string;
}> = [
  { id: 'previous_password', label: 'Contraseña anterior', type: 'password' },
  { id: 'password', label: 'Nueva contraseña', type: 'password' },
  {
    id: 'verify_password',
    label: 'Verificar nueva contraseña',
    type: 'password',
  },
];

type RequestStatus = { type: 'success' | 'error'; message: string } | null;

export function ModifyPassword({ user }: { user: any }) {
  const [formData, setFormData] = useState<SettingsFields>({
    previous_password: '',
    password: '',
    verify_password: '',
  });

  const [openModal, setOpenModal] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(null);

  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const isComplete = otpCode.every((d) => d !== '' && /\d/.test(d));

  const { formErrors, setFormErrors } = useFormErrors();

  function handleInputChange(id: keyof SettingsFields, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  }

  function validateForm() {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

    const errors: Partial<Record<keyof SettingsFields, string>> = {};

    if (formData.password && formData.password !== formData.verify_password)
      errors.verify_password = 'Las contraseñas no coinciden';

    if (formData.password && !passwordRegex.test(formData.password))
      errors.password =
        'La contraseña debe tener entre 8 y 64 caracteres, incluir una mayúscula, un número y un símbolo como mínimo.';

    if (
      !formData.previous_password ||
      !passwordRegex.test(formData.previous_password)
    )
      errors.previous_password =
        'Por favor, introduce tu contraseña actual para confirmar los cambios.';

    if (!formData.password)
      errors.password = 'Por favor, introduce una nueva contraseña.';

    if (!formData.verify_password)
      errors.verify_password = 'Por favor, verifica tu nueva contraseña.';

    return errors;
  }

  const cleanInputs = () => {
    setFormData({
      previous_password: '',
      password: '',
      verify_password: '',
    });
  };

  const executeUpdate = async (verificationCode?: string) => {
    const allowedFields = ['previous_password', 'password', 'verify_password'];
    const buildRequestData = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) =>
          allowedFields.includes(key) && value != null && value.trim() !== '',
      ),
    );

    const payload = {
      ...buildRequestData,
      ...(verificationCode && { code: verificationCode }),
    } as PasswordSettings;

    try {
      await updatePassword(payload);
      setRequestStatus({
        type: 'success',
        message: 'Los cambios se han guardado correctamente.',
      });
      setShow2FA(false);
      setOpenModal(true);
      cleanInputs();
    } catch (error: any) {
      setRequestStatus({
        type: 'error',
        message: error?.data?.error?.message || 'Error al guardar los cambios.',
      });
      setShow2FA(false);
      setOpenModal(true);
      cleanInputs();
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (user.active_2fa) {
        setShow2FA(true);
      } else {
        await executeUpdate();
      }
    }
  }

  const clearError = (id: keyof SettingsFields) => {
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  useEffect(() => {
    if (show2FA) {
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 300);
      return;
    }
    if (!show2FA) setOtpCode(Array(6).fill(''));
  }, [show2FA]);

  return (
    <div className="settings__card">
      <header className="settings__header">
        <div className="settings__icon-wrapper">
          <FiLock />
        </div>
        <div>
          <h2 className="settings__title">Cambio de contraseña</h2>
          <p className="settings__subtitle">
            Asegúrate de utilizar una contraseña segura y difícil de adivinar.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="settings__form">
        {/* Campo Contraseña Anterior */}
        <div className="settings__field">
          <FormField
            id="previous_password"
            label="Contraseña anterior"
            type="password"
            value={formData.previous_password}
            onChange={(value) => handleInputChange('previous_password', value)}
          />
          {formErrors.previous_password && (
            <div
              className="settings__field-tooltip"
              onClick={() => clearError('previous_password')}
            >
              <FiAlertCircle /> {formErrors.previous_password}
            </div>
          )}
        </div>

        {/* Campos Nueva y Verificar Contraseña en Grid */}
        <div className="settings__grid">
          <div className="settings__field">
            <FormField
              id="password"
              label="Nueva contraseña"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
            />
            {formErrors.password && (
              <div
                className="settings__field-tooltip"
                onClick={() => clearError('password')}
              >
                <FiAlertCircle /> {formErrors.password}
              </div>
            )}
          </div>

          <div className="settings__field">
            <FormField
              id="verify_password"
              label="Verificar nueva contraseña"
              type="password"
              value={formData.verify_password}
              onChange={(value) => handleInputChange('verify_password', value)}
            />
            {formErrors.verify_password && (
              <div
                className="settings__field-tooltip"
                onClick={() => clearError('verify_password')}
              >
                <FiAlertCircle /> {formErrors.verify_password}
              </div>
            )}
          </div>
        </div>

        <div className="settings__actions">
          <button type="submit" className="settings__button">
            Guardar cambios
          </button>
        </div>
      </form>

      {/* Modal 2FA */}
      <Modal
        open={show2FA}
        onClose={() => setShow2FA(false)}
        title="Confirmar con 2FA"
      >
        <div className="modal-2fa">
          <div className="modal-2fa__icon">
            <FiShield />
          </div>
          <p className="modal-2fa__text">
            Para cambiar tu contraseña introduce el código de 6 dígitos de tu
            app de autenticación.
          </p>

          <OtpInput onChange={setOtpCode} />

          <Footer2FA
            onClose={() => setShow2FA(false)}
            onVerify={() => executeUpdate(otpCode.join(''))}
            disabled={!isComplete}
          />
        </div>
      </Modal>

      {/* Modal Estado */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          requestStatus?.type === 'success' ? 'Operación exitosa' : 'Atención'
        }
      >
        <div className="modal-status">
          <div
            className={`modal-status__icon modal-status__icon--${requestStatus?.type}`}
          >
            {requestStatus?.type === 'success' ? (
              <FiCheckCircle />
            ) : (
              <FiAlertCircle />
            )}
          </div>
          <p className="modal-status__message">{requestStatus?.message}</p>
          <button
            type="button"
            className="settings__button settings__button--modal"
            onClick={() => setOpenModal(false)}
          >
            Entendido
          </button>
        </div>
      </Modal>
    </div>
  );
}
