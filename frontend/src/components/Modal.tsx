import "@styles/_modal.scss";
import { useEffect, useState } from "react";

// Componente de ventana modal reutilizable
// Props:
// - open: boolean que controla si el modal está abierto o cerrado
// - onClose: función que se llama para cerrar el modal
// - title: título opcional del modal
// - children: contenido del modal (puede ser cualquier elemento React y/o otros componentes creados por nosotros)

// Para usarlo, simplemente envuelve el contenido que deseas mostrar dentro de este y controla su visibilidad con la prop "open". Por ejemplo:
// <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="No es un título obligatorio">
//  	<p>Este es el contenido de mi modal.</p>
//  	<ComponentePersonalizado param="parametros que necesite el componente".../>
// </Modal>

// En el componente TwoFactorSettings se puede ver un ejemplo

type Props = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children?: React.ReactNode;
};

function ModalHeader(props: { title?: string; onClose: () => void }) {
	return (
		<div className="modal__header">
			<div></div>
			{props.title && (
				<h2 className="modal__header--title">{props.title}</h2>
			)}
			<button className="modal__header--close" onClick={props.onClose}>
				✕
			</button>
		</div>
	);
}

export function Modal(props: Props) {
	const [isVisible, setIsVisible] = useState(props.open);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		if (props.open) {
			setIsVisible(true);
			setIsClosing(false);
		} else {
			setIsClosing(true);
			setTimeout(() => { setIsVisible(false); }, 200);
		}
	}, [props.open]);

	if (!isVisible) return null;

	return (
		<div
			className={`modal-overlay ${isClosing ? "modal-overlay__closing" : ""}`}
			onClick={props.onClose} >
			<div
				className={`modal ${isClosing ? "modal__closing" : ""}`}
				onClick={(e) => e.stopPropagation()} >
				<ModalHeader title={props.title} onClose={props.onClose} />

				<div className="modal__content">
					{props.children}
				</div>
			</div>
		</div>
	);
}