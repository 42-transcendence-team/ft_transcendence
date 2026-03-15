import { NavLink } from "react-router-dom"
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

	// Control de valores disparado por el submit.
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		console.log("Username:", username)
		console.log("Email:", email)
		console.log("Password:", password)
		console.log("Password Repeat:", confirmPassword)
		console.log("Name:", name)
		console.log("Surname:", surname)
		console.log("Birthday:", birthday)
	}

	// Lo que se renderiza.
	return (
		<form onSubmit={handleSubmit}>
			<ul>
				<li>
					<label htmlFor="username">Username</label>
					<br></br>
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
					<br></br>
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
					<br></br>
					<input
						id="password"
						name="password"
						type="password"
						value={password}
						onChange={(e) => set(e.target.value)}
					/>
				</li>
				<li>
					<label htmlFor="confirmPassword">Confirm Password</label>
					<br></br>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="confirmPassword"
						value={confirmPassword}
						onChange={(e) => set(e.target.value)}
					/>
				</li>
				<li>
					<label>Personal Data</label>
					<label htmlFor="name">Name</label>
					<br></br>
					<input
						id="name"
						name="name"
						type="name"
						value={name}
						onChange={(e) => set(e.target.value)}
					/>
				</li>
				<li>
					<label htmlFor="surname">Surname</label>
					<br></br>
					<input
						id="surname"
						name="surname"
						type="surname"
						value={surname}
						onChange={(e) => set(e.target.value)}
					/>
				</li>
				<li>
					<label htmlFor="birthday">Birthday</label>
					<br></br>
					<input
						id="birthday"
						name="birthday"
						type="birthday"
						value={birthday}
						onChange={(e) => set(e.target.value)}
					/>
				</li>
				<li>
					<button type="submit">Register</button>
				</li>
				<p> Do you already have an account? <NavLink to="/login">Login</NavLink> </p>
			</ul>
		</form>
	)
}
