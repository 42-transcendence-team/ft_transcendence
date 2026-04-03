import "@styles/_check-true-false.scss"

import { useState } from "react";
import { CheckTrueFalse } from "@components/Check-true-false";
import { Modal } from "@components/Modal";
import { OtpInput } from "@components/Modal2FA";
import { Footer2FA } from "@components/Modal2FA";

const Activate2FAtexts = {
	headText: "Activar autenticación de dos factores (2FA)",
	contentText: "Para activar la autenticación de dos factores, escanea el siguiente código QR con tu aplicación de autenticación (como Google Authenticator o Authy) y luego ingresa el código generado por la aplicación para verificar tu identidad."
};

const CODE_LENGTH = 6;

export function Settings() {
	const [active2FA, setActive2FA] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [otpCode, setOtpCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));

	const isComplete = otpCode.every((d) => d !== "" && /\d/.test(d));

	const handleVerify = () => {
		if (!isComplete) return;
		setActive2FA(true);
		setModalOpen(false);
		console.log("OTP completo:", otpCode.join(""));
	};

	const handleCancel = () => {
		setActive2FA(false);
		setModalOpen(false);
		setOtpCode(Array(CODE_LENGTH).fill(""));
	};

	return (
		<>
			<CheckTrueFalse
				id="2fa-active"
				label="Activar autenticación de dos factores (2FA)"
				checked={active2FA || modalOpen}
				onChange={(checked) => {
					if (checked) setModalOpen(true);
					else setActive2FA(false);
				}}
			/>

			<Modal
				open={modalOpen}
				onClose={handleCancel}
				title={Activate2FAtexts.headText}
			>
				<p>{Activate2FAtexts.contentText}</p>

				<OtpInput onChange={(arr) => setOtpCode(arr)} />

				<Footer2FA
					onClose={handleCancel}
					onVerify={handleVerify}
					disabled={!isComplete}
				/>
			</Modal>
		</>
	);
}