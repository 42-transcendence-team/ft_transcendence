import "@styles/_settingsSection.scss";

import { useState } from "react"
import { FormField } from "./FormField"
import { Login } from "api/Login"

type FormErrors = {
	identifier: string
	password: string
}

export const LoginForm = ({ onSuccess, onRequires2FA }: any) => {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");

	const [errors, setErrors] = useState<FormErrors>({
		identifier: "",
		password: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [serverMessage, setServerMessage] = useState("");

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {
			identifier: "",
			password: "",
		};

		if (!identifier.trim()) {
			newErrors.identifier = "Login or email is required.";
		}

		if (!password) {
			newErrors.password = "Password is required.";
		}

		setErrors(newErrors);
		return Object.values(newErrors).every((e) => e === "");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setServerMessage("");

		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			const data = await Login(identifier, password);

			if (!data) {
				setServerMessage("Unknown error");
				return;
			}

			if (data.requires2fa) {
				onRequires2FA?.(data);
				return;
			}

			onSuccess?.(data);
		} catch (err: any) {
			setServerMessage(err?.message || "Login failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="auth-form" onSubmit={handleSubmit}>
			<FormField
				type="text"
				id="identifier"
				label="Username or Email"
				value={identifier}
				onChange={setIdentifier}
				error={errors.identifier}
				className="form-field"
				placeholder="Username or Email"
			/>

			<FormField
				id="password"
				label="Password"
				type="password"
				value={password}
				onChange={setPassword}
				error={errors.password}
				className="form-field"
				placeholder="Password"
			/>

			<button type="submit" disabled={isSubmitting} className="auth-form__submit">
				{isSubmitting ? "Logging in..." : "Login"}
			</button>

			{serverMessage && (
				<p className="auth-form__server-message">
					{serverMessage}
				</p>
			)}
		</form>
	);
};