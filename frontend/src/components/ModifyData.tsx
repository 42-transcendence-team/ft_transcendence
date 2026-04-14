import "@styles/_settingsSection.scss";

import { useState, Fragment, useEffect } from "react";
import { useFormErrors } from "@hooks/useFormErrors";
import { calculateAge } from "./RegisterForm";
import { updateData, type DataSettings } from "api/Settings";
import { FormField } from "./FormField";
import { DateInput } from "./DateInput";
import { Modal } from "./Modal";
import { Footer2FA, OtpInput } from "./TwoFactorUI";

type SettingsFields = {
	name: string;
	surname: string;
	birthday: string;
};

//TODO - Pensar como mover cosas a Hook comun para evitar repetir codigo en los 3 componentes de modificacion de datos, email y password

const inputsConfig: Array<{ id: keyof SettingsFields; label: string; type: string }> = [
	{ id: "name", label: "Nombre", type: "text" },
	{ id: "surname", label: "Apellido", type: "text" },
];

type RequestStatus = { type: "success" | "error"; message: string; } | null;

export function ModifyData({ user, onUpdate }: { user: any; onUpdate: () => void }) {
	const [formData, setFormData] = useState<SettingsFields>({
		name: "",
		surname: "",
		birthday: "",
	});

	const [openModal, setOpenModal] = useState(false);
	const [requestStatus, setRequestStatus] = useState<RequestStatus>(null);

	const [show2FA, setShow2FA] = useState(false);
	const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
	const isComplete = otpCode.every((d) => d !== "" && /\d/.test(d));

	const { formErrors, setFormErrors } = useFormErrors();

	function handleInputChange(id: keyof SettingsFields, value: string) {
		setFormData((prev) => ({ ...prev, [id]: value }));
		if (formErrors[id]) {
			setFormErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[id];
				return newErrors;
			});
		}
	};

	function validateForm() {
		const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s-]+$/
		const maxLegth = 42

		const errors: Partial<Record<keyof SettingsFields, string>> = {};
		if (formData.name && !nameRegex.test(formData.name))
			errors.name = "El nombre solo puede contener letras.";
		else if (formData.name && formData.name.length > maxLegth)
			errors.name = "El nombre es demasiado largo, máximo de 42 caracteres.";

		if (formData.surname && !nameRegex.test(formData.surname))
			errors.surname = "El apellido solo puede contener letras.";
		else if (formData.surname && formData.surname.length > maxLegth)
			errors.surname = "El apellido es demasiado largo, máximo de 42 caracteres.";

		if (formData.birthday) {
			const birthDate = new Date(formData.birthday)
			if (Number.isNaN(birthDate.getTime())) {
				errors.birthday = "Introduce una fecha de nacimiento válida."
			} else {
				const age = calculateAge(formData.birthday)
				if (age < 18)
					errors.birthday = "Debes tener al menos 18 años para registrarte."
				else if (age > 150) {
					errors.birthday = "Ojalá estuviese permitido superar los 150 años."
				}
			}
		}
		return errors;
	}

	const cleanInputs = () => {
		setFormData({
			name: "",
			surname: "",
			birthday: "",
		});
	};

	const executeUpdate = async (verificationCode?: string) => {
		const allowedFields = ["name", "surname", "birthday"];
		const buildRequestData = Object.fromEntries(
			Object.entries(formData)
				.filter(([key, value]) => allowedFields.includes(key) && value != null && value.trim() !== "")
		);

		const payload = {
			...buildRequestData,
			...(verificationCode && { code: verificationCode })
		} as DataSettings;

		try {
			await updateData(payload);
			setRequestStatus({
				type: "success",
				message: "Los cambios se han guardado correctamente."
			});
			setShow2FA(false);
			setOpenModal(true);
			cleanInputs();
			onUpdate();
		} catch (error: any) {
			setRequestStatus({
				type: "error",
				message: error?.data?.error?.message || "Error al guardar los cambios.",
			});
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
				document.getElementById("otp-0")?.focus();
			}, 300);
			return;
		}
		if (!show2FA) setOtpCode(Array(6).fill(""));
	}, [show2FA]);

	return (
		<div className="settings__section">
			<h2 className="settings__title">Configuración de la cuenta</h2>
			<form onSubmit={handleSubmit} className="settings__form">
				{inputsConfig.map((field) => (
					<Fragment key={field.id}>
						<div className="settings__field">
							<FormField
								id={field.id}
								label={field.label}
								type={field.type}
								value={formData[field.id]}
								onChange={(value) => handleInputChange(field.id, value)}
								ph={user[field.id] || undefined}
								className=""
							/>

							{formErrors[field.id] && (
								<div className="settings__field-tooltip" onClick={() => clearError(field.id)}>
									{formErrors[field.id]}
								</div>
							)}
						</div>
					</Fragment>
				))}
				<DateInput
					label="Fecha de nacimiento"
					value={formData.birthday}
					onChange={(value) => handleInputChange("birthday", value)}
					error={formErrors.birthday}
					onClearError={() => clearError("birthday")}
					placeholder={user.birthday}
					className="settings__field"
				/>
				<button type="submit" className="settings__button">
					Guardar cambios
				</button>
			</form>

			<Modal
				open={show2FA}
				onClose={() => setShow2FA(false)}
				title="Confirmar cambios"
				onSubmit={() => executeUpdate(otpCode.join(""))}
				submitDisabled={!isComplete}
			>
				<p className="modal__content">
					Para completar los cambios, introduce el código de verificación.
				</p>

				<OtpInput onChange={setOtpCode} />

				<Footer2FA
					onClose={() => setShow2FA(false)}
					onVerify={() => executeUpdate(otpCode.join(""))}
					disabled={!isComplete}
				/>
			</Modal >

			<Modal
				open={openModal}
				onClose={() => setOpenModal(false)}
				title={requestStatus?.type === "success" ? "Cambios guardados" : "Error"}
			>
				<p>{requestStatus?.message}</p>
			</Modal>
		</div >
	);
}