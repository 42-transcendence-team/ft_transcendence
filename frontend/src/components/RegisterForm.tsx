import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"

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
		if (!username.trim()) {
			newErrors.username = "El username es obligatorio."
		} else if (!usernameRegex.test(username)) {
			newErrors.username = "Solo se permiten letras, números, guion y guion bajwwwo."
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
		}
		if (!surname.trim()) {
			newErrors.surname = "El apellido es obligatorio."
		} else if (!nameRegex.test(surname)) {
			newErrors.surname = "El apellido solo puede contener letras."
		}
		if (!birthday) {
			newErrors.birthday = "La fecha de nacimiento es obligatoria."
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

	// Lo que se renderiza.
	return (
		<form onSubmit={handleSubmit}>
			<ul>
				<li>
					<label htmlFor="username">Username</label>
					<br />
					<input
						id="username"
						name="username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					{errors.username && <p>{errors.username}</p>}
				</li>
				<li>
					<label htmlFor="email">Email</label>
					<br />
					<input
						id="email"
						name="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					{errors.email && <p>{errors.email}</p>}
				</li>
				<li>
					<label htmlFor="password">Password</label>
					<br />
					<input
						id="password"
						name="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					{errors.password && <p>{errors.password}</p>}
				</li>
				<li>
					<label htmlFor="confirmPassword">Confirm Password</label>
					<br />
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					{errors.confirmPassword && <p>{errors.confirmPassword}</p>}
				</li>
				<br />
				<li>
					<label>--- Personal Data ---</label>
				</li>
				<br />
				<li>
					<label htmlFor="name">Name</label>
					<br />
					<input
						id="name"
						name="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					{errors.name && <p>{errors.name}</p>}
				</li>
				<li>
					<label htmlFor="surname">Surname</label>
					<br />
					<input
						id="surname"
						name="surname"
						type="text"
						value={surname}
						onChange={(e) => setSurname(e.target.value)}
					/>
					{errors.surname && <p>{errors.surname}</p>}
				</li>
				<li>
					<label htmlFor="birthday">Birthday</label>
					<br />
					<input
						id="birthday"
						name="birthday"
						type="date"
						value={birthday}
						onChange={(e) => setBirthday(e.target.value)}
					/>
					{errors.birthday && <p>{errors.birthday}</p>}
				</li>
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
