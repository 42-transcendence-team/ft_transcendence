import { NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { FormField } from "./FormField"
import { Login, Login2FA } from "api/Login"
import { Modal } from "@components/Modal"
import { OtpInput, Footer2FA } from "@components/TwoFactorUI"

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

	const [show2FA, setShow2FA] = useState(false);
	const [tempToken, setTempToken] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
	const isComplete = otpCode.every((d) => d !== "" && /\d/.test(d));

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
		e.preventDefault();
		setServerMessage("");
		if (!validateForm()) return;

		setIsSubmitting(true);
		try {
			const data = await Login(identifier, password);

			if (!data) {
				setServerMessage("Error desconocido al intentar iniciar sesión.");
				setIsSubmitting(false);
				return;
			}

			if (data.requires2fa) {
				setTempToken(data.user?.tempToken || null);
				setShow2FA(true);
				setIsSubmitting(false);
				return;
			}

			setErrors({ identifier: "", password: "" });
			setServerMessage("");
			navigate("/");
		} catch (err: any) {
			if (err?.status === 400 && err.data?.errors) {
				setErrors((prev) => ({
					...prev,
					identifier: err.data.errors.identifier || "",
					password: err.data.errors.password || "",
				}));
				setServerMessage(err.data?.message || "Datos de acceso inválidos.");
			} else if (err?.status === 401 || err?.status === 403) {
				setServerMessage(err.data?.message || "Login/email o contraseña incorrectos.");
			} else if (err?.status >= 500) {
				setServerMessage("Error interno del servidor.");
			} else if (err instanceof Error) {
				setServerMessage(err.message);
			} else {
				setServerMessage("No se pudo iniciar sesión.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVerify2FA = async () => {
		if (!isComplete || !tempToken) return;

		try {
			await Login2FA(otpCode.join(""));
			setShow2FA(false);
			navigate("/");
		} catch (err: any) {
			alert(err.message);
		}
	};

	const fields = [
		{
			id: "identifier",
			label: "Username or Email",
			type: "text",
			value: identifier,
			onChange: setIdentifier,
			error: errors.identifier,
			placeholder: "Login or Email",
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
	]

	return (
		<>
			<form className="auth-form" onSubmit={handleSubmit}>
				<div className="auth-form__group">
					{fields.map((field) => (
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
				
				<button className="auth-form__submit" type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Logging in..." : "Login"}
				</button>
				
				{serverMessage && <p className="auth-form__server-message">{serverMessage}</p>}
				
				<p className="auth-form__switch">
					Don&apos;t have an account yet? <NavLink to="/register">Register</NavLink>
				</p>
			</form>
				
			<Modal
				open={show2FA}
				onClose={() => setShow2FA(false)}
				onSubmit={handleVerify2FA}
				submitDisabled={!isComplete}
				title="Verificación 2FA"
			>
				<p className="modal__content">
					Para completar el inicio de sesión, ingresa el código de verificación 2FA generado por tu aplicación de autenticación.
				</p>
				<OtpInput onChange={setOtpCode} />
				<Footer2FA
					onClose={() => setShow2FA(false)}
					onVerify={handleVerify2FA}
					disabled={!isComplete}
				/>
			</Modal>
		</>
	)
}
