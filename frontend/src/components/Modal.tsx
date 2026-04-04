import "@styles/_modal.scss";
import { useEffect, useRef, useState } from "react";

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
	onSubmit?: () => void;
	submitDisabled?: boolean;
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
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (props.open) {
			setIsVisible(true);
			setIsClosing(false);
		} else {
			setIsClosing(true);
			setTimeout(() => { setIsVisible(false); }, 200);
		}
	}, [props.open]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;

		if (e.key === "Escape") {
			e.preventDefault();
			props.onClose();
			return;
		}

		if (e.key === "Enter" && props.onSubmit && !props.submitDisabled &&
			target.tagName !== "TEXTAREA") {
			e.preventDefault();
			props.onSubmit();
			return;
		}

		if (target.tagName === "INPUT") return;

		if (e.key !== "Tab") return;

		const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (!focusable?.length) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	};

	if (!isVisible) return null;

	return (
		<div
			className={`modal-overlay ${isClosing ? "modal-overlay__closing" : ""}`}
			onClick={props.onClose}
		>
			<div
				ref={modalRef}
				className={`modal ${isClosing ? "modal__closing" : ""}`}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={handleKeyDown}
				tabIndex={-1}
			>
				<ModalHeader title={props.title} onClose={props.onClose} />

				<div className="modal__content">
					{props.children}
				</div>
			</div>
		</div>
	);
}