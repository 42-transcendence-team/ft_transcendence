import "@styles/_settingsSection.scss";

import { useState, Fragment } from "react";
import { useFormErrors } from "@hooks/useFormErrors";
import { calculateAge } from "./RegisterForm";
import { updateData } from "api/Settings";
import { FormField } from "./FormField";
import { DateInput } from "./DateInput";
import { Modal } from "./Modal";

type SettingsFields = {
	name: string;
	surname: string;
	birthday: string;
};

const inputsConfig: Array<{ id: keyof SettingsFields; label: string; type: string }> = [
	{ id: "name", label: "Nombre", type: "text" },
	{ id: "surname", label: "Apellido", type: "text" },
];

type RequestStatus = { type: "success" | "error"; message: string; } | null;

//TODO: Si el usuario tiene 2FA activo, solicitar codigo en modal para confirmar

export function ModifyData({ user }: { user: any }) {
	const [formData, setFormData] = useState<SettingsFields>({
		name: "",
		surname: "",
		birthday: "",
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

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const errors = validateForm();
		setFormErrors(errors);

		if (Object.keys(errors).length === 0) {
			const allowedFields = ["name", "surname", "birthday"];

			const buildRequestData = Object.fromEntries(
				Object.entries(formData)
					.filter(([key, value]) => allowedFields.includes(key) &&
						value != null && value.trim() !== "")
			);

			try {
				await updateData(buildRequestData)

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
				open={openModal}
				onClose={() => setOpenModal(false)}
				title={requestStatus?.type === "success" ? "Cambios guardados" : "Error"}
			>
				<p>{requestStatus?.message}</p>
			</Modal>
		</div>
	);
}