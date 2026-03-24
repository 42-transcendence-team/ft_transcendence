import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"

type FormErrors = {
	identifier: string
	password: string
}

export const LoginForm = () => {
	const navigate = useNavigate()
	const [identifier, setIdentifier] = useState("")
	const [password, setPassword] = useState("")
	const [errors, setErrors] = useState<FormErrors>({
		identifier: "",
		password: ""
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [serverMessage, setServerMessage] = useState("")
	const validateForm = (): FormErrors => {
		const newErrors: FormErrors = {
			identifier: "",
			password: ""
		}
		const usernameRegex = /^[A-Za-z0-9_-]+$/
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/
		if (!identifier) {
			newErrors.identifier = "Login o Email faltante"
		} else if (!usernameRegex.test(identifier)) {
			newErrors.identifier = "Login inválido: Solo se permiten letras, números, guion y guion bajo."
		} else if (!emailRegex.test(identifier)) {
			newErrors.identifier = "Email inválido: Estructura inválida"
		}
		if (!password) {
			newErrors.password = "Contraseña faltante"
		} else if (!passwordRegex.test(password)) {
			newErrors.password =
				"La contraseña debe tener entre 8 y 64 caracteres, incluir una mayúscula, un número y un símbolo como mínimo."
		}
		setErrors(newErrors)
		return Object.values(newErrors).every((error) => error === "")
	}

// Archivos a revisar:
//		backend/internal/handlers/authHandler.go

// TODO handleSubmit

	return (
		<form onSubmit={handleSubmit}>
			<ul>
				<li>
					<label htmlFor="identifier">Username or Email</label>
					<br />
					<input
						id="identifier"
						name="identifier"
						type="text"
						value={identifier}
						onChange={(e) => setIdentifier(e.target.value)}
					/>
					{errors.identifier && <p>{errors.identifier}</p>}
				</li>
				<li>
					<label htmlFor="identifier">Password</label>
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
					<button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Logining..." : "Login"}
					</button>
				</li>
			</ul>
			{serverMessage && <p>{serverMessage}</p>}
			<p>
				Don't have an account yet? <NavLink to="/register">Register</NavLink>
			</p>
		</form>
	)
}