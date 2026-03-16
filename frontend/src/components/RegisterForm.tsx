import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"

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

	// useNavigate() devuelve la función navigate que permite
	// redirigir programáticamente a otra ruta.
	const navigate = useNavigate()

	// Control de valores disparado por el submit.
	// Revisa:
	//		backend/internal/routes/authRouter.go
	//		backend/internal/handlers/authHandler.go
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
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
			const response = await fetch("http://localhost:8080/auth/register", {
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
				navigate("/login")
				return
			}
			if (response.status === 400) {
				console.log("Body inválido")
				return
			}
			if (response.status === 422) {
				console.log("Error de validación")
				return
			}
			if (response.status === 409) {
				console.log("Conflicto, probablemente usuario o email ya existente")
				return
			}
		} catch (error) {
			console.error("Error de red:", error)
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
				</li>
				<li>
					<label>Personal Data</label>
				</li>
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
				</li>
				<li>
					<button type="submit">Register</button>
				</li>
			</ul>
				<li>
					<p> Do you already have an account? <NavLink to="/login">Login</NavLink> </p>
				</li>
		</form>
	)
}
