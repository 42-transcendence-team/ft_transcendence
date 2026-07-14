import "@styles/_modal.scss";
import { useEffect, useRef, useState } from "react";

// Componente de ventana modal reutilizable
// Props:
// - open: boolean que controla si el modal está abierto o cerrado
// - onClose: función que se llama para cerrar el modal
// - onSubmit: función opcional que se ejecuta con Enter si no está deshabilitada
// - submitDisabled: bloquea el submit con Enter
// - title: título opcional del modal
// - children: contenido del modal
// - closeOnEscape: permite desactivar el cierre con Escape si hay otra modal encima
// - overlayClassName/modalClassName/contentClassName: clases extra opcionales para casos específicos

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
	closeOnEscape?: boolean;
	overlayClassName?: string;
	modalClassName?: string;
	contentClassName?: string;
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

	const shouldCloseOnEscape = props.closeOnEscape ?? true;

	const overlayClassName = [
		"modal-overlay",
		props.overlayClassName,
		isClosing ? "modal-overlay__closing" : "",
	]
		.filter(Boolean)
		.join(" ");

	const modalClassName = [
		"modal",
		props.modalClassName,
		isClosing ? "modal__closing" : "",
	]
		.filter(Boolean)
		.join(" ");

	const contentClassName = [
		"modal__content",
		props.contentClassName,
	]
		.filter(Boolean)
		.join(" ");

	useEffect(() => {
		const handleKeyDownGlobal = (e: KeyboardEvent) => {
			if (e.key === "Escape" && props.open && shouldCloseOnEscape)
				props.onClose();
		};

		if (props.open) {
			setIsVisible(true);
			setIsClosing(false);
			document.addEventListener("keydown", handleKeyDownGlobal);
		} else {
			setIsClosing(true);
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, 200);
			document.removeEventListener("keydown", handleKeyDownGlobal);
			return () => clearTimeout(timer);
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDownGlobal);
		};
	}, [props.open, props.onClose, shouldCloseOnEscape]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;

		if (e.key === "Escape" && shouldCloseOnEscape) {
			e.preventDefault();
			props.onClose();
			return;
		}

		if (
			e.key === "Enter" &&
			props.onSubmit &&
			!props.submitDisabled &&
			target.tagName !== "TEXTAREA"
		) {
			e.preventDefault();
			props.onSubmit();
			return;
		}

		if (target.tagName === "INPUT") return;

		if (e.key !== "Tab") return;

		const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
			className={overlayClassName}
			onClick={props.onClose}
		>
			<div
				ref={modalRef}
				className={modalClassName}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={handleKeyDown}
				tabIndex={-1}
			>
				<ModalHeader title={props.title} onClose={props.onClose} />

				<div className={contentClassName}>
					{props.children}
				</div>
			</div>
		</div>
	);
}
