import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { FormField } from "./FormField"

// Archivos a revisar:
//		backend/internal/handlers/authHandler.go

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
		password: "",
	})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [serverMessage, setServerMessage] = useState("")
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {
			identifier: "",
			password: "",
		}
		const MAX_PASSWORD_LENGTH = 64
		if (!identifier.trim()) {
			newErrors.identifier = "Login o email faltante."
		}
		if (!password) {
			newErrors.password = "Contraseña faltante."
		} else if (password.length > MAX_PASSWORD_LENGTH) {
			newErrors.password = `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres.`
		}
		setErrors(newErrors)
		return Object.values(newErrors).every((error) => error === "")
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setServerMessage("")
		if (!validateForm()) return
		setIsSubmitting(true)
		try {
			const response = await fetch("http://localhost:8080/api/v1/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					identifier: identifier.trim(),
					password: password,
				}),
			})
			let data: any = null
			try {
				data = await response.json()
			} catch {
				data = null
			}
			if (!response.ok) {
				if (response.status === 400) {
					if (data?.errors && typeof data.errors === "object") {
						setErrors((prev) => ({
							...prev,
							identifier: data.errors.identifier || "",
							password: data.errors.password || "",
						}))
						setServerMessage(data?.message || "Datos de acceso inválidos.")
					} else {
						setServerMessage(data?.message || "Petición inválida.")
					}
				} else if (response.status === 401 || response.status === 403) {
					setServerMessage(data?.message || "Login/email o contraseña incorrectos.")
				} else if (response.status >= 500) {
					setServerMessage("Error interno del servidor.")
				} else {
					setServerMessage(data?.message || "No se pudo iniciar sesión.")
				}
				return
			}
			setErrors({
				identifier: "",
				password: "",
			})
			setServerMessage("")
			navigate("/")
		} catch {
			setServerMessage("Error de conexión con el servidor.")
		} finally {
			setIsSubmitting(false)
		}
	}

	const fields = [
		{
			id: "identifier",
			label: "Username or Email",
			type: "text",
			value: identifier,
			onChange: setIdentifier,
			error: errors.identifier,
		},
		{
			id: "password",
			label: "Password",
			type: "password",
			value: password,
			onChange: setPassword,
			error: errors.password,
		},
	]

	return (
		<form onSubmit={handleSubmit}>
			<ul>
				{fields.map((field) => (
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
						{isSubmitting ? "Logging in..." : "Login"}
					</button>
				</li>
			</ul>
			{serverMessage && <p>{serverMessage}</p>}
			<p>
				Don&apos;t have an account yet? <NavLink to="/register">Register</NavLink>
			</p>
		</form>
	)
}
