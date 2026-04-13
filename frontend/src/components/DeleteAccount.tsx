import { useState } from "react";
import { Modal } from "./Modal";

//TODO: Si el usuario tiene 2FA activo, solicitar codigo en modal para confirmar

export function DeleteAccount({ user }: { user: any }) {
	const [openModal, setOpenModal] = useState(false);

	return (
		<div className="settings__section">
			<h2 className="settings__title">Eliminar cuenta</h2>
			<p>Estás a punto de eliminar tu cuenta.</p>
			<button className="settings__button settings__button--danger" onClick={() => setOpenModal(true)}>
				Eliminar cuenta
			</button>
			<Modal
				open={openModal}
				onClose={() => setOpenModal(false)}
				title="Confirmar eliminación"
			>
				<p>¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.</p>
				<button className="settings__button settings__button--danger" onClick={() => {
					setOpenModal(false);
				}}>
					Eliminar cuenta
				</button>
			</Modal>
		</div>
	);
}