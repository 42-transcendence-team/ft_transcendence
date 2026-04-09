import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
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

const isValidAgeForRegister = (birthDateString: string): boolean => {
	const birthDate = new Date(birthDateString)

	// Fecha inválida
	if (Number.isNaN(birthDate.getTime())) {
		return false
	}

	const age = calculateAge(birthDateString)
	return age >= 18 && age <= 150
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
		const maxLegth = 42
		if (!username.trim()) {
			newErrors.username = "El username es obligatorio."
		} else if (!usernameRegex.test(username)) {
			newErrors.username = "Solo se permiten letras, números, guion y guion bajo."
		} else if (username.length > maxLegth) {
			newErrors.username = "No está permitido, máximo de 42 caracteres."
		}
		if (!email.trim()) {
			newErrors.email = "El email es obligatorio."
		} else if (!emailRegex.test(email)) {
			newErrors.email = "Introduce un email válido."
		}
		if (!password) {
			newErrors.password = "La contraseña es obligatoria."
		} else if (!passwordRegex.test(password)) {
			newErrors.password =
				"La contraseña debe tener entre 8 y 64 caracteres, incluir una mayúscula, un número y un símbolo como mínimo."
		}
		if (!confirmPassword) {
			newErrors.confirmPassword = "Debes confirmar la contraseña."
		} else if (confirmPassword !== password) {
			newErrors.confirmPassword = "Las contraseñas no coinciden."
		}
		if (!name.trim()) {
			newErrors.name = "El nombre es obligatorio."
		} else if (!nameRegex.test(name)) {
			newErrors.name = "El nombre solo puede contener letras."
		} else if (name.length > maxLegth) {
			newErrors.name = "No está permitido, máximo de 42 caracteres."
		}
		if (!surname.trim()) {
			newErrors.surname = "El apellido es obligatorio."
		} else if (!nameRegex.test(surname)) {
			newErrors.surname = "El apellido solo puede contener letras."
		} else if (surname.length > maxLegth) {
			newErrors.surname = "No está permitido, máximo de 42 caracteres."
		}
		if (!birthday) {
			newErrors.birthday = "La fecha de nacimiento es obligatoria."
		} else {
			const birthDate = new Date(birthday)
			if (Number.isNaN(birthDate.getTime())) {
				newErrors.birthday = "Introduce una fecha de nacimiento válida."
			} else {
				const age = calculateAge(birthday)
				if (age < 18) {
					newErrors.birthday = "Debes tener al menos 18 años para registrarte."
				} else if (age > 150) {
					newErrors.birthday = "Ojalá estuviese permitido superar los 150 años."
				}
			}
		}
		setErrors(newErrors)
		return Object.values(newErrors).every((error) => error === "")
	}

	// Control de valores disparado por el submit.
	// Revisa:
	//		backend/internal/routes/authRouter.go
	//		backend/internal/handlers/authHandler.go
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setServerMessage("")
		const isValid = validateForm()
		if (!isValid) {
			return
		}
		console.log("Username:", username)
		console.log("Email:", email)
		console.log("Password:", password)
		console.log("Password Repeat:", confirmPassword)
		console.log("Name:", name)
		console.log("Surname:", surname)
		console.log("Birthday:", birthday)
		const payload = {
			login: username, // Yo uso `username`, el backend `login`
			email,
			password,
			confirmPassword,
			name,
			surname,
			birthday
		}

		console.log("Payload:", payload)

		try {
			setIsSubmitting(true)
			const response = await fetch("http://localhost:8080/api/v1/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(payload)
			})
			const data = await response.json()
			console.log("status:", response.status)
			console.log("response:", data)
			if (response.status === 201) {
				console.log("Usuario creado correctamente")
				setServerMessage("Usuario creado correctamente.")
				navigate("/login")
				return
			}
			if (response.status === 400) {
				console.log("Body inválido")
				setServerMessage("La petición no es válida.")
				return
			}
			if (response.status === 422) {
				console.log("Error de validación")
				setServerMessage("Hay campos inválidos. Revisa el formulario.")
				return
			}
			if (response.status === 409) {
				console.log("Conflicto, probablemente usuario o email ya existente")
				setServerMessage("El username o el email ya existen.")
				return
			}
			setServerMessage("Ha ocurrido un error inesperado.")
		} catch (error) {
			console.error("Error de red:", error)
			setServerMessage("Error de red al conectar con el servidor.")
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
		},
		{
			id: "email",
			label: "Email",
			type: "email",
			value: email,
			onChange: setEmail,
			error: errors.email,
		},
		{
			id: "password",
			label: "Password",
			type: "password",
			value: password,
			onChange: setPassword,
			error: errors.password,
		},
		{
			id: "confirmPassword",
			label: "Confirm Password",
			type: "password",
			value: confirmPassword,
			onChange: setConfirmPassword,
			error: errors.confirmPassword,
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
		},
		{
			id: "surname",
			label: "Surname",
			type: "text",
			value: surname,
			onChange: setSurname,
			error: errors.surname,
		},
		{
			id: "birthday",
			label: "Birthday",
			type: "date",
			value: birthday,
			onChange: setBirthday,
			error: errors.birthday,
		},
	]

	// Lo que se renderiza.
	return (
		<form onSubmit={handleSubmit}>
			<ul>
				{accountFields.map((field) => (
					<FormField
						key={field.id}
						id={field.id}
						label={field.label}
						type={field.type}
						value={field.value}
						onChange={field.onChange}
						error={field.error}
					/>
				))}

				<li>
					<h3>Personal Data</h3>
				</li>

				{personalFields.map((field) => (
					<FormField
						key={field.id}
						id={field.id}
						label={field.label}
						type={field.type}
						value={field.value}
						onChange={field.onChange}
						error={field.error}
					/>
				))}

				<li>
					<button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Registering..." : "Register"}
					</button>
				</li>
			</ul>

			{serverMessage && <p>{serverMessage}</p>}

			<p>
				Do you already have an account? <NavLink to="/login">Login</NavLink>
			</p>
		</form>
	)
}
