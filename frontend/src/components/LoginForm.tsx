import { NavLink } from "react-router-dom"
import { useState } from "react"
import { FormField } from "./FormField"
import { Login, Login2FA, getAuthenticatedUser } from "api/Login"
import { Modal } from "@components/Modal"
import { OtpInput, Footer2FA } from "@components/TwoFactorUI"
import { useAuth } from "@components/auth-router/AuthContext"

// Formulario de login.
// Valida credenciales, gestiona el flujo 2FA y actualiza el estado global de autenticación.
type FormErrors = {
	identifier: string
	password: string
}

export const LoginForm = () => {
	const { refreshAuth } = useAuth()

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
			newErrors.identifier = "Login or email is required."
		}
		if (!password) {
			newErrors.password = "Password is required."
		} else if (password.length > MAX_PASSWORD_LENGTH) {
			newErrors.password = `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`
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
			console.log("LOGIN DATA:", data)
			console.log("LOGIN USER LOGIN:", data?.user?.login);
			
			if (!data) {
				setServerMessage("Unknown error while trying to log in.");
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
			
			// Refrescamos el estado global de autenticación antes de redirigir.
			await refreshAuth();

			const login = data.user?.login;
			console.log("LOGIN USER LOGIN:", login);
			if (login) {
				window.location.href = `/app/profile/${login}`;
			} else {
				window.location.href = "/app";
			}
		} catch (err: any) {
			console.log("LOGIN ERROR:", err)
			console.log("LOGIN ERROR STATUS:", err?.status)
			console.log("LOGIN ERROR DATA:", err?.data)

			if (err?.status === 400 && err.data?.errors) {
				setErrors((prev) => ({
					...prev,
					identifier: err.data.errors.identifier || "",
					password: err.data.errors.password || "",
				}));
				setServerMessage(err.data?.message || "Invalid login data.");
			} else if (err?.status === 401 || err?.status === 403) {
				setServerMessage(err.data?.message || "Incorrect login/email or password.");
			} else if (err?.status >= 500) {
				setServerMessage("Internal server error.");
			} else if (err?.message) {
				setServerMessage(err.message);
			} else {
				setServerMessage("Could not log in.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVerify2FA = async () => {
		if (!isComplete || !tempToken) return;

		try {
			await Login2FA(otpCode.join(""));
			await refreshAuth();

			const data = await getAuthenticatedUser();
			setShow2FA(false);

			const login = data.user?.login;

			if (login) {
				window.location.href = `/app/profile/${login}`;
				return;
			}

			window.location.href = "/app";
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
				title="2FA Verification"
			>
				<p className="modal__content">
					To complete the login, enter the 2FA verification code generated by your authentication app.
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
