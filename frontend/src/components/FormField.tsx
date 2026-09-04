type FormFieldProps = {
  id: string;
  label?: string;
  name?: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
};

export const FormField = ({
  id,
  label,
  type,
  value,
  onChange,
  error,
  className,
  placeholder,
}: FormFieldProps) => {
  return (
    <div className="form-field">
      {label && (
        <label
          htmlFor={id}
          className={className ? `${className}__label` : 'default-label'}
        >
          {label}
        </label>
      )}

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={className ? `${className}__input` : 'default-input'}
        autoComplete="off"
      />

      {error && (
        <p className={className ? `${className}__tooltip` : 'default-tooltip'}>
          {error}
        </p>
      )}
    </div>
  );
};
