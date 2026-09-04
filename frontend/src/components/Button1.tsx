import type React from 'react';
import '../styles/components/_button1.scss';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'disabled';

interface Button1Props {
  onClick?: () => void;
  label?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button1: React.FC<Button1Props> = ({
  onClick,
  label = 'Share',
  variant = 'primary',
  disabled = false,
  children,
}) => {
  return (
    <button
      type="button"
      className={`button1 button1--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children || label}
    </button>
  );
};
