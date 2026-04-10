type Props = {
	label: string;
	checked: boolean;
	id: string;
	onChange: (checked: boolean) => void;
};

export function CheckTrueFalse(props: Props) {
	return (
		<div className="check-true-false">
			<label htmlFor={props.id} className="check-true-false__label">
				{props.label}
			</label>
			<input
				id={props.id}
				type="checkbox"
				checked={props.checked}
				onChange={(e) => props.onChange(e.target.checked)}
				className="check-true-false__input"
			/>
		</div>
	);
}