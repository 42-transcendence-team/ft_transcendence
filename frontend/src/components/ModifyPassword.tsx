import "@styles/_settingsSection.scss";

import React, { Fragment, useState } from "react";
import { FormField } from "./FormField";
import { updatePassword } from "api/Settings";
import { Modal } from "./Modal";
import { useFormErrors } from "@hooks/useFormErrors";

type SettingsFields = {
	previous_password: string;
	password: string;
	verify_password: string;
};

const inputsConfig: Array<{ id: keyof SettingsFields; label: string; type: string }> = [
	{ id: "previous_password", label: "Contraseña anterior", type: "password" },
	{ id: "password", label: "Nueva contraseña", type: "password" },
	{ id: "verify_password", label: "Verificar nueva contraseña", type: "password" },
];

type RequestStatus = { type: "success" | "error"; message: string; } | null;

//TODO: Si el usuario tiene 2FA activo, solicitar codigo en modal para confirmar

export function ModifyPassword({ user }: { user: any }) {
	const [formData, setFormData] = useState<SettingsFields>({
		previous_password: "",
		password: "",
		verify_password: "",
	});

	const [openModal, setOpenModal] = useState(false);
	const [requestStatus, setRequestStatus] = useState<RequestStatus>(null);

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
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/

		const errors: Partial<Record<keyof SettingsFields, string>> = {};

		if (formData.password && formData.password !== formData.verify_password)
			errors.verify_password = "Las contraseñas no coinciden";

		if (formData.password && !passwordRegex.test(formData.password))
			errors.password =
				"La contraseña debe tener entre 8 y 64 caracteres, incluir una mayúscula, un número y un símbolo como mínimo.";

	
		return errors;
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const errors = validateForm();
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			const allowedFields = ["previous_password", "password", "verify_password"];

			const buildRequestData = Object.fromEntries(
				Object.entries(formData)
					.filter(([key, value]) => allowedFields.includes(key) &&
						value != null && value.trim() !== "")
			);

			try {
				await updatePassword(buildRequestData)

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

	return (
		<div className="settings__section">
			<h2 className="settings__title">Cambio de contraseña</h2>
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
				<button type="submit" className="settings__button">
					Guardar cambios
				</button>
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