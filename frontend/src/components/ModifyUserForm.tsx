import "@styles/_tooltipSettings.scss";

import React, { Fragment, useEffect, useState } from "react";
import { FormField } from "./FormField";
import { updateSettings } from "api/Settings";
import { calculateAge } from "./RegisterForm";
import { Modal } from "./Modal";
import { DateInput } from "./DateInput";

type SettingsFields = {
	email: string;
	verify_email: string;
	previous_password: string;
	password: string;
	verify_password: string;
	name: string;
	surname: string;
	birthday: string;
};

const inputsConfig: Array<{ id: keyof SettingsFields; label: string; type: string }> = [
	{ id: "email", label: "Email", type: "email" },
	{ id: "verify_email", label: "Verificar email", type: "email" },
	{ id: "previous_password", label: "Contraseña anterior", type: "password" },
	{ id: "password", label: "Nueva contraseña", type: "password" },
	{ id: "verify_password", label: "Verificar nueva contraseña", type: "password" },
	{ id: "name", label: "Nombre", type: "text" },
	{ id: "surname", label: "Apellido", type: "text" },
];

type RequestStatus = { type: "success" | "error"; message: string; } | null;

export function ModifyUserForm({ user }: { user: any }) {
	const [formData, setFormData] = useState<SettingsFields>({
		email: "",
		verify_email: "",
		previous_password: "",
		password: "",
		verify_password: "",
		name: "",
		surname: "",
		birthday: "",
	});

	const [openModal, setOpenModal] = useState(false);
	const [requestStatus, setRequestStatus] = useState<RequestStatus>(null);
	const [formErrors, setFormErrors] = useState<Partial<Record<keyof SettingsFields, string>>>({});

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
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s-]+$/
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/
		const maxLegth = 42

		const errors: Partial<Record<keyof SettingsFields, string>> = {};
		if (formData.email && formData.email !== formData.verify_email)
			errors.verify_email = "Los emails no coinciden";

		if (formData.password && formData.password !== formData.verify_password)
			errors.verify_password = "Las contraseñas no coinciden";

		if (formData.email && !emailRegex.test(formData.email))
			errors.email = "Introduce un email válido.";

		if (formData.password && !passwordRegex.test(formData.password))
			errors.password =
				"La contraseña debe tener entre 8 y 64 caracteres, incluir una mayúscula, un número y un símbolo como mínimo.";

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

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const errors = validateForm();
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			const allowedFields = ["email", "password", "name", "surname", "birthday"];

			const buildRequestData = Object.fromEntries(
				Object.entries(formData)
					.filter(([key, value]) => allowedFields.includes(key) &&
						value != null && value.trim() !== "")
			);

			try {
				await updateSettings(buildRequestData)

				setRequestStatus({
					type: "success",
					message: "Los cambios se han guardado correctamente.",
				});

				setOpenModal(true);

			} catch (error: any) {
				setRequestStatus({
					type: "error",
					message: error?.data?.error?.message || "Error al guardar los cambios.",
				});

				setOpenModal(true);
			}
		}
	};

	const clearError = (id: keyof SettingsFields) => {
		setFormErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[id];
			return newErrors;
		});
	};

	useEffect(() => {
		if (Object.keys(formErrors).length > 0) {
			const timer = setTimeout(() => {
				setFormErrors({});
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [formErrors]);

	return (
		<div className="">
			<h2>Configuración de la cuenta</h2>
			<form onSubmit={handleSubmit} className="">
				{inputsConfig.map((field, index) => (
					<Fragment key={field.id}>
						{(index === 2 || index === 5) && <span className="">-</span>}
						<div style={{ position: 'relative', width: '100%' }}>
							<FormField
								id={field.id}
								label={field.label}
								type={field.type}
								value={formData[field.id]}
								onChange={(value) => handleInputChange(field.id, value)}
								ph={user[field.id] || undefined}
							/>

							{formErrors[field.id] && (
								<div className="field-tooltip" onClick={() => clearError(field.id)}>
									{formErrors[field.id]}
								</div>
							)}
						</div>
					</Fragment>
				))}
				<DateInput
					label="Fecha de nacimiento"
					value={user.birthday}
					onChange={(value) => handleInputChange("birthday", value)}
					error={formErrors.birthday}
					onClearError={() => clearError("birthday")}
					placeholder={user.birthday}
				/>
				<button type="submit">Guardar cambios</button>
			</form>
			<Modal
				open={openModal}
				onClose={() => setOpenModal(false)}
				title={requestStatus?.type === "success" ? "Cambios guardados" : "Error"}
			>
				<p>{requestStatus?.message}</p>
			</Modal>
		</div>
	);
}