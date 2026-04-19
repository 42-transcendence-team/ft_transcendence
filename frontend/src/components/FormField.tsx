type FormFieldProps = {
	id: string
	label: string
	type: string
	value: string
	onChange: (value: string) => void
	error?: string
	placeholder?: string
}

export const FormField = ({
	id,
	label,
	type,
	value,
	onChange,
	error,
	placeholder,
}: FormFieldProps) => {
	return (
		<div className="form-field">
			<label className="form-field__label" htmlFor={id}>
				{label}
			</label>

			<input
				className={`form-field__input ${error ? "form-field__input--error" : ""}`}
				id={id}
				name={id}
				type={type}
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
			/>

			{error && <p className="form-field__error">{error}</p>}
		</div>
	)
}
