import { useState } from "react";
import { Modal } from "./Modal";
import { Footer2FA, OtpInput } from "./TwoFactorUI";
import { deleteAccount } from "api/Settings";

export function DeleteAccount({ user }: { user: any }) {
	const [password, setPassword] = useState("");
	const [openConfirmModal, setOpenConfirmModal] = useState(false);

	const [show2FA, setShow2FA] = useState(false);
	const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
	const isComplete = otpCode.every((d) => d !== "" && /\d/.test(d));

	const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
	const [openStatusModal, setOpenStatusModal] = useState(false);

	const handleDeleteAttempt = () => {
		if (!password) {
			setStatus({ type: "error", message: "Por favor, introduce tu contraseña." });
			setOpenStatusModal(true);
			return;
		}

		if (validatePassword() === 1) {
			setPassword("");
			return;
		}

		if (user.active_2fa) {
			setOpenConfirmModal(false);
			setShow2FA(true);
		} else {
			executeDelete();
		}
	};

	const executeDelete = async (code?: string) => {
		try {
			await deleteAccount({ password, code: code || undefined });

			setStatus({ type: "success", message: "Cuenta eliminada correctamente. Redirigiendo..." });
			setOpenStatusModal(true);

			setTimeout(() => {
				window.location.href = "/login";
			}, 5000);

		} catch (error: any) {
			setStatus({
				type: "error",
				message: error?.data?.error?.message || "La contraseña o el código son incorrectos.",
			});
			setOpenStatusModal(true);
		}
	};

	function validatePassword() {
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

		if (password && !passwordRegex.test(password)) {
			setStatus({ type: "error", message: "La contraseña no cumple con los requisitos de seguridad." });
			setOpenStatusModal(true);
			return 1
		}
		return 0;
	}

	return (
		<div className="settings__section">
			<h2 className="settings__title">Zona de peligro</h2>
			<div className="settings__danger-zone">
				<p>Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.</p>
				<button
					className="settings__button settings__button--danger"
					onClick={() => setOpenConfirmModal(true)}
				>
					Eliminar mi cuenta definitivamente
				</button>
			</div>

			<Modal
				open={openConfirmModal}
				onClose={() => setOpenConfirmModal(false)}
				title="¿Estás absolutamente seguro?"
			>
				<div className="modal__content">
					<p>Esta acción es irreversible. Por favor, introduce tu contraseña para continuar:</p>
					<input
						type="password"
						className="settings__input"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Tu contraseña actual"
						autoFocus
					/>
				</div>
				<Footer2FA
					onClose={() => setOpenConfirmModal(false)}
					onVerify={handleDeleteAttempt}
					disabled={!password}
				/>
			</Modal>

			<Modal
				open={show2FA}
				onClose={() => setShow2FA(false)}
				title="Verificación de seguridad"
			>
				<p className="modal__content">Introduce el código 2FA para autorizar la eliminación de la cuenta.</p>
				<OtpInput onChange={setOtpCode} />
				<Footer2FA
					onClose={() => setShow2FA(false)}
					onVerify={() => executeDelete(otpCode.join(""))}
					disabled={!isComplete}
				/>
			</Modal>

			<Modal open={openStatusModal} onClose={() => setOpenStatusModal(false)} title="Eliminar cuenta">
				<p>{status?.message}</p>
			</Modal>
		</div>
	);
}