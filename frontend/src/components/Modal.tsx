import "@styles/_modal.scss";
import { useEffect, useState } from "react";

type Props = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children?: React.ReactNode;
};

function ModalHeader(props: { title?: string; onClose: () => void }) {
	return (
		<div className="modal__header">
			<button className="modal__header--close" onClick={props.onClose}>
				✕
			</button>
			{props.title && (
				<h2 className="modal__header--title">{props.title}</h2>
			)}
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