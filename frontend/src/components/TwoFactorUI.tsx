import { useRef, useState, Fragment } from "react";

import "@styles/_modal.scss";
import "@styles/_otpInput.scss";

const CODE_LENGTH = 6;

export function OtpInput({ onChange }: { onChange?: (code: string[]) => void }) {
	const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
	const inputsRef = useRef<HTMLInputElement[]>([]);

	const handleChange = (value: string, index: number) => {
		if (!/^\d?$/.test(value)) return;

		const newCode = [...code];
		newCode[index] = value;
		setCode(newCode);

		if (onChange) onChange(newCode);

		if (value && index < CODE_LENGTH - 1)
			inputsRef.current[index + 1]?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
		if (e.key === "Backspace" && !code[index] && index > 0)
			inputsRef.current[index - 1]?.focus();
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
		
		if (!paste) return;

		const newCode = paste.split("");
		const filled = [...newCode, ...Array(CODE_LENGTH - newCode.length).fill("")];
		setCode(filled);

		if (onChange) onChange(filled);

		const nextIndex = newCode.length < CODE_LENGTH ? newCode.length : CODE_LENGTH - 1;
		inputsRef.current[nextIndex]?.focus();
	};

	return (
		<div className="otp">
			{code.map((digit, index) => (
				<Fragment key={index}>
					{index === 3 && <span className="otp__separator">-</span>}
					<input
						id={`otp-${index}`}
						ref={(el) => { if (el) inputsRef.current[index] = el; }}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digit}
						onChange={(e) => handleChange(e.target.value, index)}
						onKeyDown={(e) => handleKeyDown(e, index)}
						onPaste={handlePaste}
						autoComplete="off"
						className="otp__input" />
				</Fragment>
			))}
		</div>
	);
}

type Props = {
	onClose: () => void;
	onVerify: () => void;
	disabled: boolean;
};

export function Footer2FA(props: Props) {
	return (
		<div className="modal__footer">
			<button
				className="modal__button modal__button--enable"
				onClick={props.onVerify}
				disabled={props.disabled} >
				Verificar
			</button>

			<button
				className="modal__button modal__button--disable"
				onClick={props.onClose} >
				Cancelar
			</button>
		</div>
	);
}

export function TwoFactorQRCode({ qrBase64 }: { qrBase64: string }) {
  return (
    <div className="otp__qr">
      <p className="otp__qr--text">Escanea este código con tu app de autenticación:</p>
      <img
        src={`data:image/png;base64,${qrBase64}`}
        alt="Código QR 2FA"
        className="otp__qr--image"
      />
    </div>
  );
}