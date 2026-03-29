type FormFieldProps = {
	id: string
	label: string
	type: string
	value: string
	onChange: (value: string) => void
	error?: string
}

export const FormField = ({
	id,
	label,
	type,
	value,
	onChange,
	error,
}: FormFieldProps) => {
	return (
		<li>
			<label htmlFor={id}>{label}</label>
			<br />
			<input
				id={id}
				name={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			{error && <p>{error}</p>}
		</li>
	)
}
