import React from "react";
import "../styles/components/_button1.scss";
import { Link } from 'react-router-dom';

type ButtonVariant =
	| "primary"
	| "secondary"
	| "danger"
	| "disabled";

interface Button1Props {
	onClick?: () => void;
	label?: string;
	variant?: ButtonVariant;
	disabled?: boolean;
	to?: string;
}

export const Button1: React.FC<Button1Props> = ({
	onClick,
	label = "Share",
	variant = "primary",
	disabled = false,
	to,
}) => {
		if (to) {
		return (
		<div className='action-buttons'>
			<Link to={to} className='share-btn'>
			{label}
			</Link>
		</div>
		);
	}
	return (
		<button
			type="button"
			className={`button1 button1--${variant}`}
			onClick={onClick}
			disabled={disabled}
		>
			{label}
		</button>
	);
};