import "@styles/_tooltipSettings.scss";

import React, { Fragment, useState } from "react";
import { useFormErrors } from "@hooks/useFormErrors";
import { FormField } from "./FormField";
import { updateEmail } from "api/Settings";
import { Modal } from "./Modal";

// TODO: NO FUNCIONA ERROR 422

type SettingsFields = {
	email: string;
	verify_email: string;
};

const inputsConfig: Array<{ id: keyof SettingsFields; label: string; type: string }> = [
	{ id: "email", label: "Email", type: "email" },
	{ id: "verify_email", label: "Verificar email", type: "email" },
];

type RequestStatus = { type: "success" | "error"; message: string; } | null;

export function ModifyEmail({ user }: { user: any }) {
	const [formData, setFormData] = useState<SettingsFields>({
		email: "",
		verify_email: "",
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
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		const errors: Partial<Record<keyof SettingsFields, string>> = {};
		if (formData.email && formData.email !== formData.verify_email)
			errors.verify_email = "Los emails no coinciden";
		else if (formData.email && !formData.verify_email)
			errors.verify_email = "Por favor, verifica tu email.";
		else if (formData.verify_email && !formData.email)
			errors.email = "Por favor, introduce tu email.";
		else if (formData.email && !emailRegex.test(formData.email))
			errors.email = "El email no es válido.";
		return errors;
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const errors = validateForm();
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			const allowedFields = ["email", "verify_email"];

			const buildRequestData = Object.fromEntries(
				Object.entries(formData)
					.filter(([key, value]) => allowedFields.includes(key) &&
						value != null && value.trim() !== "")
			);

			try {
				await updateEmail(buildRequestData)

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
		<div className="">
			<h2 className="">Configuración de la cuenta</h2>
			<form onSubmit={handleSubmit} className="">
				{inputsConfig.map((field) => (
					<Fragment key={field.id}>
						<div className="">
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
								<div className="field-tooltip" onClick={() => clearError(field.id)}>
									{formErrors[field.id]}
								</div>
							)}
						</div>
					</Fragment>
				))}
				<button type="submit" className="">Guardar cambios</button>
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