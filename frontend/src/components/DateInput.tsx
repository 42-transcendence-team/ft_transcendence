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

export function DateInput(props: DateInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

    const formatDate = (dateValue: string) => {
        if (!dateValue) return "";
        
        const datePart = dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
        const date = new Date(datePart + "T00:00:00");

        if (isNaN(date.getTime())) return dateValue;

        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const displayValue = props.value
        ? formatDate(props.value)
        : props.placeholder 
            ? formatDate(props.placeholder) 
            : "Selecciona una fecha";

	return (
		<div className={`settings__field ${props.className ? `${props.className}-container` : "container-date"}`}>
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