import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { registerUser } from "../api/Register"
import { FormField } from "./FormField"
import { calculateAge } from "../utils/calculateAge"
import { useAuth as useRouterAuth } from "@components/auth-router/AuthContext";
import { useAuth as useUserAuth } from "../context/AuthContext";

type FormErrors = {
	username: string
	email: string
	password: string
	confirmPassword: string
	name: string
	surname: string
	birthday: string
}

export const RegisterForm = () => {
	// La siguiente estructura sintáctica se denomina "Array destructuring".
	// useState devuelve un array con dos elementos:
	// [estadoActual, funciónDeActualizaciónDeEstado]
	// Así extraemos los dos valores en variables independientes.
	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [name, setName] = useState("")
	const [surname, setSurname] = useState("")
	const [birthday, setBirthday] = useState("") // YYYY-MM-DD
	const [termsAndConditions, setTermsAndConditions] = useState(false)
	const [privacyPolicy, setPrivacyPolicy] = useState(false)

	const [errors, setErrors] = useState<FormErrors>({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
		surname: "",
		birthday: ""
	})
	const [serverMessage, setServerMessage] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	// useNavigate() devuelve la función navigate que permite
	// redirigir programáticamente a otra ruta.
	const navigate = useNavigate()
	const { refreshAuth } = useRouterAuth()
	const { refreshUser } = useUserAuth()
	const validateForm = () => {
		const newErrors: FormErrors = {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			name: "",
			surname: "",
			birthday: ""
		}
		const usernameRegex = /^[A-Za-z0-9_-]+$/
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s-]+$/
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/
		const maxLength = 42
		if (!username.trim()) {
			newErrors.username = "Debes introducir un nombre de usuario."
		} else if (!usernameRegex.test(username)) {
			newErrors.username = "Solo se permiten letras, números, guiones y guiones bajos."
		} else if (username.length > maxLength) {
			newErrors.username = "La longitud máxima es de 42 caracteres."
		}

		if (!email.trim()) {
			newErrors.email = "Debes introducir el correo electrónico."
		} else if (!emailRegex.test(email)) {
			newErrors.email = "Introduce una dirección de correo electrónico válida."
		}

		if (!password) {
			newErrors.password = "Debes introducir una contraseña."
		} else if (!passwordRegex.test(password)) {
			newErrors.password =
				"La contraseña debe tener entre 8 y 64 caracteres e incluir al menos una mayúscula, un número y un símbolo."
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = "Debes confirmar la contraseña."
		} else if (confirmPassword !== password) {
			newErrors.confirmPassword = "Las contraseñas no coinciden."
		}

		if (!name.trim()) {
			newErrors.name = "Debes introducir el nombre."
		} else if (!nameRegex.test(name)) {
			newErrors.name = "El nombre solo puede contener letras."
		} else if (name.length > maxLength) {
			newErrors.name = "La longitud máxima es de 42 caracteres."
		}

		if (!surname.trim()) {
			newErrors.surname = "Debes introducir los apellidos."
		} else if (!nameRegex.test(surname)) {
			newErrors.surname = "Los apellidos solo pueden contener letras."
		} else if (surname.length > maxLength) {
			newErrors.surname = "La longitud máxima es de 42 caracteres."
		}

		if (!birthday) {
			newErrors.birthday = "Debes introducir la fecha de nacimiento."
		} else {
			const birthDate = new Date(birthday)
		
			if (Number.isNaN(birthDate.getTime())) {
				newErrors.birthday = "Introduce una fecha de nacimiento válida."
			} else {
				const age = calculateAge(birthday)
			
				if (age < 18) {
					newErrors.birthday = "Debes tener al menos 18 años para registrarte."
				} else if (age > 150) {
					newErrors.birthday = "La edad no puede superar los 150 años."
				}
			}
		}
		setErrors(newErrors)
		return Object.values(newErrors).every((error) => error === "")
	}

	// Gestiona el submit, valida el formulario y envía el payload mediante el helper de registro.
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setServerMessage("")

		const isValid = validateForm()
		if (!isValid) {
			return
		}

		const payload = {
			login: username, // Yo uso `username`, el backend `login`
			email,
			password,
			confirmPassword,
			name,
			surname,
			birthday,
			termsAndConditions,
			privacyPolicy,
		}

		try {
			setIsSubmitting(true)

			await registerUser(payload)

			setServerMessage("La cuenta se ha creado correctamente.")

			await refreshAuth()
			await refreshUser()
			navigate("/app")
			return
		} catch (error) {
			console.error("Register error:", error)

			if (
				typeof error === "object" &&
				error !== null &&
				"status" in error
			) {
				const apiError = error as { status: number }

				if (apiError.status === 400) {
					setServerMessage("La solicitud no es válida.")
					return
				}

				if (apiError.status === 422) {
					setServerMessage("Algunos campos no son válidos. Revisa el formulario.")
					return
				}

				if (apiError.status === 409) {
					setServerMessage("El nombre de usuario o el correo electrónico ya están registrados.")
					return
				}
			}

			setServerMessage("Se ha producido un error inesperado. Inténtalo de nuevo.")
		} finally {
			setIsSubmitting(false)
		}
	}

	// Arrays de campos configurados para evitar la repetición de código en cada uno de los campos del formulario.

	const accountFields = [
		{
			id: "username",
			label: "Nombre de usuario",
			type: "text",
			value: username,
			onChange: setUsername,
			error: errors.username,
			placeholder: "Nombre de usuario",
		},
		{
			id: "email",
			label: "Correo electrónico",
			type: "email",
			value: email,
			onChange: setEmail,
			error: errors.email,
			placeholder: "Correo electrónico",
		},
		{
			id: "password",
			label: "Contraseña",
			type: "password",
			value: password,
			onChange: setPassword,
			error: errors.password,
			placeholder: "Contraseña",
		},
		{
			id: "confirmPassword",
			label: "Confirmar contraseña",
			type: "password",
			value: confirmPassword,
			onChange: setConfirmPassword,
			error: errors.confirmPassword,
			placeholder: "Repite la contraseña",
		},
	]

	const personalFields = [
		{
			id: "name",
			label: "Nombre",
			type: "text",
			value: name,
			onChange: setName,
			error: errors.name,
			placeholder: "Nombre",
		},
		{
			id: "surname",
			label: "Apellidos",
			type: "text",
			value: surname,
			onChange: setSurname,
			error: errors.surname,
			placeholder: "Apellidos",
		},
		{
			id: "birthday",
			label: "Fecha de nacimiento",
			type: "date",
			value: birthday,
			onChange: setBirthday,
			error: errors.birthday,
			placeholder: "",
		},
	]

	// Lo que se renderiza.
	return (
		<form className="auth-form" onSubmit={handleSubmit}>
			
			<div className="auth-form__section auth-form__section--account">
				<h3 className="auth-form__section-title">DATOS DE LA CUENTA</h3>
			</div>

			<div className="auth-form__group auth-form__group--account">
				{accountFields.map((field) => (
					<FormField
						key={field.id}
						id={field.id}
						label={field.label}
						type={field.type}
						value={field.value}
						onChange={field.onChange}
						error={field.error}
						placeholder={field.placeholder}
						className="form-field"
					/>
				))}
			</div>

			<div className="auth-form__section auth-form__section--personal">
				<h3 className="auth-form__section-title">DATOS PERSONALES</h3>
			</div>

			<div className="auth-form__group auth-form__group--personal">
				{personalFields.map((field) => (
					<FormField
						key={field.id}
						id={field.id}
						label={field.label}
						type={field.type}
						value={field.value}
						onChange={field.onChange}
						error={field.error}
						placeholder={field.placeholder}
						className="form-field"
					/>
				))}
			</div>

			<div className="auth-form__checkboxes">
				<label className="auth-form__check">
					<input
						type="checkbox"
						checked={termsAndConditions}
						onChange={(e) => setTermsAndConditions(e.target.checked)}
						required
					/>
					<span>He leído los términos y condiciones...</span>
				</label>
						
				<label className="auth-form__check">
					<input
						type="checkbox"
						checked={privacyPolicy}
						onChange={(e) => setPrivacyPolicy(e.target.checked)}
						required
					/>
					<span>Acepto la política de privacidad</span>
				</label>
			</div>

			<button className="auth-form__submit" type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
			</button>

			{serverMessage && <p className="auth-form__server-message">{serverMessage}</p>}

			<p className="auth-form__switch">
				¿Ya tienes una cuenta? <NavLink to="/login">Iniciar sesión</NavLink>
			</p>
		</form>
	)
}