import "@styles/_settingsSection.scss";

import React, { Fragment, useEffect, useState } from "react";
import { useFormErrors } from "@hooks/useFormErrors";
import { FormField } from "./FormField";
import { updateEmail, type EmailSettings } from "api/Settings";
import { Modal } from "./Modal";
import { Footer2FA, OtpInput } from "./TwoFactorUI";
import { FiMail, FiShield, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

type SettingsFields = {
	email: string;
	verify_email: string;
};

// TODO - Pensar como mover cosas a Hook comun para evitar repetir codigo en los 3 componentes de modificacion de datos, email y password
// TODO - Aplicar estilos al formulario

const inputsConfig: Array<{ id: keyof SettingsFields; label: string; type: string }> = [
	{ id: "email", label: "Email", type: "email" },
	{ id: "verify_email", label: "Verificar email", type: "email" },
];

type RequestStatus = { type: "success" | "error"; message: string; } | null;

export function ModifyEmail({ user, onUpdate }: { user: any; onUpdate: () => void }) {
	const [formData, setFormData] = useState<SettingsFields>({
		email: "",
		verify_email: "",
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
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		const errors: Partial<Record<keyof SettingsFields, string>> = {};

		if (!formData.email || !formData.verify_email) {
			if (!formData.email)
				errors.email = "Por favor, introduce tu nuevo email.";
			if (!formData.verify_email)
				errors.verify_email = "Por favor, verifica tu nuevo email.";
		}
		else if (formData.email && !emailRegex.test(formData.email))
			errors.email = "El email no es válido.";
		else if (formData.email !== formData.verify_email)
			errors.verify_email = "Los emails no coinciden";
		return errors;
	}

	const cleanInputs = () => {
		setFormData({
			email: "",
			verify_email: "",
		});
	};

	const executeUpdate = async (verificationCode?: string) => {
		const allowedFields = ["email", "verify_email"];
		const buildRequestData = Object.fromEntries(
			Object.entries(formData)
				.filter(([key, value]) => allowedFields.includes(key) &&
					value != null && value.trim() !== "")
		);

		const payload = {
			...buildRequestData,
			...(verificationCode && { code: verificationCode })
		} as EmailSettings;

		try {
			await updateEmail(payload);
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
					document.getElementById("otp-0")?.focus();
				}, 300);
				return;
			}
			if (!show2FA) setOtpCode(Array(6).fill(""));
		}, [show2FA]);

	return (
		<div className="settings__card">
			<header className="settings__header">
				<div className="settings__icon-wrapper">
					<FiMail />
				</div>
				<div>
					<h2 className="settings__title">Cambio de email</h2>
					<p className="settings__subtitle">
						Actualiza la dirección de correo electrónico vinculada a tu cuenta.
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
								placeholder={user[field.id] || undefined}
							/>

							{formErrors[field.id] && (
								<div className="settings__field-tooltip" onClick={() => clearError(field.id)}>
									<FiAlertCircle /> {formErrors[field.id]}
								</div>
							)}
						</div>
					))}
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
						Para actualizar tu email introduce el código de 6 dígitos de tu app de autenticación.
					</p>

					<OtpInput onChange={setOtpCode} />

					<Footer2FA
						onClose={() => setShow2FA(false)}
						onVerify={() => executeUpdate(otpCode.join(""))}
						disabled={!isComplete}
					/>
				</div>
			</Modal>

			{/* Modal Estado */}
			<Modal
				open={openModal}
				onClose={() => setOpenModal(false)}
				title={requestStatus?.type === "success" ? "Operación exitosa" : "Atención"}
			>
				<div className="modal-status">
					<div className={`modal-status__icon modal-status__icon--${requestStatus?.type}`}>
						{requestStatus?.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
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