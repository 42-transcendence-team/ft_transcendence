import "@styles/_check-true-false.scss"

import { useEffect, useState } from "react";
import { CheckTrueFalse } from "@components/Check-true-false";
import { Modal } from "@components/Modal";
import { OtpInput } from "@components/TwoFactorUI";
import { Footer2FA } from "@components/TwoFactorUI";

const CODE_LENGTH = 6;

type Mode = "enable" | "disable";

const texts = {
	enable: {
		title: "Activar autenticación en dos factores",
		content:
			"Para activar la autenticación de dos factores, escanea el código QR con tu app de autenticación y luego ingresa el código generado.",
	},
	disable: {
		title: "Desactivar autenticación en dos factores",
		content:
			"Para desactivar la autenticación de dos factores, ingresa el código generado por tu app para confirmar la desactivación.",
	},
};

export function TwoFactorSettings() {
		const [active2FA, setActive2FA] = useState(false);
		const [modalOpen, setModalOpen] = useState(false);
		const [mode, setMode] = useState<Mode>("enable");
		const [otpCode, setOtpCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
		const [animating, setAnimating] = useState<"on" | "off" | null>(null);
	
		const isComplete = otpCode.every(d => d !== "" && /\d/.test(d));
	
		useEffect(() => {
			if (!modalOpen) setOtpCode(Array(CODE_LENGTH).fill(""));
		}, [modalOpen]);
	
		const handleToggle = (checked: boolean) => {
			if (checked) {
				setMode("enable");
				setModalOpen(true);
				setAnimating("on");
			} else {
				setMode("disable");
				setModalOpen(true);
				setAnimating("off");
			}
		};
	
		const handleVerify = () => {
			if (!isComplete) return;
	
			if (mode === "enable") setActive2FA(true);
			else setActive2FA(false);
	
			setAnimating(null);
			setModalOpen(false);
		};
	
		const handleClose = () => {
			setAnimating(null);
			setModalOpen(false);
			setOtpCode(Array(CODE_LENGTH).fill(""));
		};
	
		return (
			<>
				<CheckTrueFalse
					id="2fa-active"
					label="Autenticación en dos factores (2FA)"
					checked={animating ? animating === "on" : active2FA}
					onChange={handleToggle}
				/>
	
				<Modal
					open={modalOpen}
					onClose={handleClose}
					title={texts[mode].title}
				>
					<p>{texts[mode].content}</p>
	
					<OtpInput
						onChange={(code) =>
							setOtpCode(code.slice(0, CODE_LENGTH))
						}
					/>
	
					<Footer2FA
						onClose={handleClose}
						onVerify={handleVerify}
						disabled={!isComplete}
					/>
				</Modal>
			</>
		);
}