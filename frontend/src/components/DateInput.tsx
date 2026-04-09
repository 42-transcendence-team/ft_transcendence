import { useRef } from "react";

type DateInputProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	onClearError?: () => void;
	className?: string;
};

// TODO: REVISAR PREVIEW DE DECHA NACIMIENTO, NO ACTUALIZA CON NUEVA FECHA ANTES DE GUARDAR

export function DateInput(props: DateInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const displayValue = props.value
		? new Date(props.value).toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
		  })
		: props.placeholder || "Selecciona una fecha";

	return (
		<div className={props.className ? `${props.className}-container` : "container-date"}>
			<label className={props.className ? `${props.className}-label` : "date-label"}>
				{props.label}
			</label>

			<div
				onClick={() => inputRef.current?.showPicker()}
				className={props.className ? `${props.className}-date` : "date-field"}
			>
				{displayValue}
			</div>

			<input
				ref={inputRef}
				type="date"
				value={props.value}
				onChange={(e) => props.onChange(e.target.value)}
				style={{
					position: "absolute",
					opacity: 0,
					pointerEvents: "none"
				}}
			/>

			{props.error && (
				<div
					className={props.className ? `${props.className}-tooltip` : "date-tooltip"}
					onClick={props.onClearError}
				>
					{props.error}
				</div>
			)}
		</div>
	);
}