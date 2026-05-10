import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { registerUser } from "../api/Register"
import { FormField } from "./FormField"

type FormErrors = {
	username: string
	email: string
	password: string
	confirmPassword: string
	name: string
	surname: string
	birthday: string
}

export const calculateAge = (birthDateString: string): number => {
	const today = new Date()
	const birthDate = new Date(birthDateString)

	let age = today.getFullYear() - birthDate.getFullYear()

	const monthDiff = today.getMonth() - birthDate.getMonth()
	const dayDiff = today.getDate() - birthDate.getDate()

	// Si todavía no ha cumplido años este año, restamos 1
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--
	}

	return age
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
			newErrors.username = "Username is required."
		} else if (!usernameRegex.test(username)) {
			newErrors.username = "Only letters, numbers, hyphens and underscores are allowed."
		} else if (username.length > maxLength) {
			newErrors.username = "Maximum length is 42 characters."
		}

		if (!email.trim()) {
			newErrors.email = "Email is required."
		} else if (!emailRegex.test(email)) {
			newErrors.email = "Enter a valid email address."
		}

		if (!password) {
			newErrors.password = "Password is required."
		} else if (!passwordRegex.test(password)) {
			newErrors.password =
				"Password must be between 8 and 64 characters and include at least one uppercase letter, one number and one symbol."
		}

		if (!confirmPassword) {
			newErrors.confirmPassword = "You must confirm your password."
		} else if (confirmPassword !== password) {
			newErrors.confirmPassword = "Passwords do not match."
		}

		if (!name.trim()) {
			newErrors.name = "Name is required."
		} else if (!nameRegex.test(name)) {
			newErrors.name = "Name can only contain letters."
		} else if (name.length > maxLength) {
			newErrors.name = "Maximum length is 42 characters."
		}

		if (!surname.trim()) {
			newErrors.surname = "Surname is required."
		} else if (!nameRegex.test(surname)) {
			newErrors.surname = "Surname can only contain letters."
		} else if (surname.length > maxLength) {
			newErrors.surname = "Maximum length is 42 characters."
		}

		if (!birthday) {
			newErrors.birthday = "Birthday is required."
		} else {
			const birthDate = new Date(birthday)
		
			if (Number.isNaN(birthDate.getTime())) {
				newErrors.birthday = "Enter a valid birthday."
			} else {
				const age = calculateAge(birthday)
			
				if (age < 18) {
					newErrors.birthday = "You must be at least 18 years old to register."
				} else if (age > 150) {
					newErrors.birthday = "Age cannot be greater than 150 years."
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

			setServerMessage("User created successfully.")
			navigate("/login")
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
					setServerMessage("Invalid request.")
					return
				}

				if (apiError.status === 422) {
					setServerMessage("Some fields are invalid. Please check the form.")
					return
				}

				if (apiError.status === 409) {
					setServerMessage("Username or email already exists.")
					return
				}
			}

			setServerMessage("Unexpected error. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	// Arrays de campos configurados para evitar la repetición de código en cada uno de los campos del formulario.

	const accountFields = [
		{
			id: "username",
			label: "Username",
			type: "text",
			value: username,
			onChange: setUsername,
			error: errors.username,
			placeholder: "Login",
		},
		{
			id: "email",
			label: "Email",
			type: "email",
			value: email,
			onChange: setEmail,
			error: errors.email,
			placeholder: "Email",
		},
		{
			id: "password",
			label: "Password",
			type: "password",
			value: password,
			onChange: setPassword,
			error: errors.password,
			placeholder: "Password",
		},
		{
			id: "confirmPassword",
			label: "Confirm Password",
			type: "password",
			value: confirmPassword,
			onChange: setConfirmPassword,
			error: errors.confirmPassword,
			placeholder: "Repeat Password",
		},
	]

	const personalFields = [
		{
			id: "name",
			label: "Name",
			type: "text",
			value: name,
			onChange: setName,
			error: errors.name,
			placeholder: "Name",
		},
		{
			id: "surname",
			label: "Surname",
			type: "text",
			value: surname,
			onChange: setSurname,
			error: errors.surname,
			placeholder: "Surname",
		},
		{
			id: "birthday",
			label: "Birthday",
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
				<h3 className="auth-form__section-title">ACCOUNT DATA</h3>
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
				<h3 className="auth-form__section-title">PERSONAL DATA</h3>
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
					<span>I read Terms and Conditions...</span>
				</label>
						
				<label className="auth-form__check">
					<input
						type="checkbox"
						checked={privacyPolicy}
						onChange={(e) => setPrivacyPolicy(e.target.checked)}
						required
					/>
					<span>I accept Privacy Policy</span>
				</label>
			</div>

			<button className="auth-form__submit" type="submit" disabled={isSubmitting}>
				{isSubmitting ? "Registering..." : "Create Now"}
			</button>

			{serverMessage && <p className="auth-form__server-message">{serverMessage}</p>}

			<p className="auth-form__switch">
				Do you already have an account? <NavLink to="/login">Login</NavLink>
			</p>
		</form>
	)
}
