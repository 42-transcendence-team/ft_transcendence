import { OtpInput } from "@components/TwoFactorUI"
import logo from "../assets/icons/24_logo.png"
import { LoginForm } from "../components/LoginForm"
import "../styles/pages/_authPages.scss"
import { NavLink } from "react-router-dom"
import { useState } from "react"

export const Login2fa = () => {
	const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
	// const isComplete = otpCode.every((d) => d !== "" && /\d/.test(d));

	console.log("OTP Code:", otpCode.join(""))

	return (
		<section className="auth-page">
			<p className="auth-card__subtitle">
				Enter the 6-digit code from your authenticator app to complete login.
			</p>
			<OtpInput onChange={setOtpCode} />
		</section>
	)
}