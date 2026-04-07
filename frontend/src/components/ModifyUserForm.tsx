import { useState } from "react";
import { FormField } from "./FormField";

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
  { id: "birthday", label: "Fecha de nacimiento", type: "date" },
];

export function ModifyUserForm() {
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

  const handleInputChange = (id: keyof SettingsFields, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos a enviar:", formData);
  };

  return (
    <div>
      <h2>Configuración de la cuenta</h2>
      <form onSubmit={handleSubmit}>
        {inputsConfig.map((field) => (
          <FormField
            key={field.id}
            id={field.id}
            label={field.label}
            type={field.type}
            value={formData[field.id]}
            onChange={(value) => handleInputChange(field.id, value)}
          />
        ))}
        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
}