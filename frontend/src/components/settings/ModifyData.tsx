import '@styles/_settingsSection.scss';

import { useFormErrors } from '@hooks/useFormErrors';
import { type DataSettings, updateData } from 'api/Settings';
import { Fragment, useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiShield, FiUser } from 'react-icons/fi';
import { calculateAge } from '../../utils/calculateAge';
import { DateInput } from '../DateInput';
import { FormField } from '../FormField';
import { Modal } from '../Modal';
import { Footer2FA, OtpInput } from '../TwoFactorUI';

type SettingsFields = {
  name: string;
  surname: string;
  birthday: string;
};

// TODO - Pensar como mover cosas a Hook comun para evitar repetir codigo en los 3 componentes de modificacion de datos, email y password
// TODO - Aplicar estilos al formulario

const inputsConfig: Array<{
  id: keyof SettingsFields;
  label: string;
  type: string;
}> = [
  { id: 'name', label: 'Nombre', type: 'text' },
  { id: 'surname', label: 'Apellido', type: 'text' },
];

type RequestStatus = { type: 'success' | 'error'; message: string } | null;

export function ModifyData({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate: () => void;
}) {
  const [formData, setFormData] = useState<SettingsFields>({
    name: '',
    surname: '',
    birthday: '',
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
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s-]+$/;
    const maxLegth = 42;

    const errors: Partial<Record<keyof SettingsFields, string>> = {};
    if (formData.name && !nameRegex.test(formData.name))
      errors.name = 'El nombre solo puede contener letras.';
    else if (formData.name && formData.name.length > maxLegth)
      errors.name = 'El nombre es demasiado largo, máximo de 42 caracteres.';

    if (formData.surname && !nameRegex.test(formData.surname))
      errors.surname = 'El apellido solo puede contener letras.';
    else if (formData.surname && formData.surname.length > maxLegth)
      errors.surname =
        'El apellido es demasiado largo, máximo de 42 caracteres.';

    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      if (Number.isNaN(birthDate.getTime())) {
        errors.birthday = 'Introduce una fecha de nacimiento válida.';
      } else {
        const age = calculateAge(formData.birthday);
        if (age < 18)
          errors.birthday = 'Debes tener al menos 18 años para registrarte.';
        else if (age > 150) {
          errors.birthday = 'Ojalá estuviese permitido superar los 150 años.';
        }
      }
    }
    return errors;
  }

  const cleanInputs = () => {
    setFormData({
      name: '',
      surname: '',
      birthday: '',
    });
  };

  const executeUpdate = async (verificationCode?: string) => {
    const allowedFields = ['name', 'surname', 'birthday'];
    const buildRequestData = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) =>
          allowedFields.includes(key) && value != null && value.trim() !== '',
      ),
    );

    if (Object.keys(buildRequestData).length === 0) {
      setRequestStatus({
        type: 'error',
        message: 'No se han detectado cambios para guardar.',
      });
      setOpenModal(true);
      return;
    }

    const payload = {
      ...buildRequestData,
      ...(verificationCode && { code: verificationCode }),
    } as DataSettings;

    try {
      await updateData(payload);
      setRequestStatus({
        type: 'success',
        message: 'Los cambios se han guardado correctamente.',
      });
      setShow2FA(false);
      setOpenModal(true);
      cleanInputs();
      onUpdate();
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
    <div>
      <div className="settings__card">
        <header className="settings__header">
          <div className="settings__icon-wrapper">
            <FiUser />
          </div>
          <div>
            <h2 className="settings__title">Información personal</h2>
            <p className="settings__subtitle">
              Actualiza tus datos personales y fecha de nacimiento.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="settings__form">
          <div className="settings__grid">
            {inputsConfig.map((field) => (
              <div className="settings__field" key={field.id}>
                <FormField
                  id={field.id}
                  label={field.label}
                  type={field.type}
                  value={formData[field.id]}
                  onChange={(value) => handleInputChange(field.id, value)}
                  placeholder={user[field.id] || 'No especificado'}
                />

                {formErrors[field.id] && (
                  <div
                    className="settings__field-tooltip"
                    onClick={() => clearError(field.id)}
                  >
                    <FiAlertCircle /> {formErrors[field.id]}
                  </div>
                )}
              </div>
            ))}
          </div>

          <DateInput
            label="Fecha de nacimiento"
            value={formData.birthday}
            onChange={(value) => handleInputChange('birthday', value)}
            error={formErrors.birthday}
            onClearError={() => clearError('birthday')}
            placeholder={user.birthday}
          />

          <div className="settings__actions">
            <button type="submit" className="settings__button">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Modal de confirmación 2FA */}
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
            Para guardar tus datos introduce el código de 6 dígitos de tu app de
            autenticación.
          </p>

          <OtpInput onChange={setOtpCode} />

          <Footer2FA
            onClose={() => setShow2FA(false)}
            onVerify={() => executeUpdate(otpCode.join(''))}
            disabled={!isComplete}
          />
        </div>
      </Modal>

      {/* Modal de estado (éxito/error) */}
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
