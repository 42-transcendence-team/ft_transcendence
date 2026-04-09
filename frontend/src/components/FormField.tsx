type FormFieldProps = {
	id: string
	label?: string
	type: string
	value: string
	onChange: (value: string) => void
	error?: string
	className?: string
	ph?: string
}

export const FormField = ({
	id,
	label,
	type,
	value,
	onChange,
	error,
	ph,
	className,
}: FormFieldProps) => {
	return (
		<li>
			{label && <label htmlFor={id} className={className ? `${className}-label` : "default-label"}>{label}</label>}
			<br />
			<input
				id={id}
				name={id}
				type={type}
				value={value}
				placeholder={ph}
				onChange={(e) => onChange(e.target.value)}
				className={className ? `${className}-input` : "default-input"}
			/>
			{error && <p className={className ? `${className}-tooltip` : "default-tooltip"}>{error}</p>}
		</li>
	)
}
