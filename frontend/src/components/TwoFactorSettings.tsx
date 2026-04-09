import "@styles/_check-true-false.scss"

import { useEffect, useState } from "react";
import { CheckTrueFalse } from "@components/Check-true-false";
import { Modal } from "@components/Modal";
import { OtpInput, TwoFactorQRCode } from "@components/TwoFactorUI";
import { Footer2FA } from "@components/TwoFactorUI";
import { disable2FA, enable2FA, verify2FA } from "api/Twofactor";

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

export function TwoFactorSettings(active: { active: boolean }) {
	const [active2FA, setActive2FA] = useState(active.active);
	const [modalOpen, setModalOpen] = useState(false);
	const [mode, setMode] = useState<Mode>("enable");
	const [otpCode, setOtpCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
	const [animating, setAnimating] = useState<"on" | "off" | null>(null);
	const [qr, setQr] = useState<string>("");

	const isComplete = otpCode.every(d => d !== "" && /\d/.test(d));

	useEffect(() => {
		if (modalOpen) {
			setTimeout(() => {
				document.getElementById("otp-0")?.focus();
			}, 300);
			return;
		}
		if (!modalOpen) setOtpCode(Array(CODE_LENGTH).fill(""));
	}, [modalOpen]);

	const handleToggle = async (checked: boolean) => {
		if (checked) {
			setMode("enable");
			setModalOpen(true);
			setAnimating("on");
			const res = await enable2FA();
			setQr(res.QR);
		} else {
			setMode("disable");
			setModalOpen(true);
			setAnimating("off");
		}
	};

	const handleVerify = async () => {
		if (!isComplete) return;

		try {
			const codeStr = otpCode.join("");
			if (mode === "enable") {
				await verify2FA(codeStr);
				setActive2FA(true);
			} else {
				await disable2FA(codeStr);
				setActive2FA(false);
			}

			setModalOpen(false);
			setAnimating(null);
			setOtpCode(Array(CODE_LENGTH).fill(""));
		} catch (err) {
			console.error(err);
			alert((err as Error).message);
		}
	};

	const handleClose = () => {
		if (animating === "on")
			setActive2FA(false);
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
				onSubmit={handleVerify}
				submitDisabled={!isComplete}
				title={texts[mode].title}
			>
				<p>{texts[mode].content}</p>

				{mode === "enable" && qr && (
					<TwoFactorQRCode qrBase64={qr} />
				)}

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