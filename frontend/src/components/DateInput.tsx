import { useRef } from 'react';
import { FiAlertCircle, FiCalendar } from 'react-icons/fi';

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
    if (!dateValue) return '';

    const datePart = dateValue.includes('T')
      ? dateValue.split('T')[0]
      : dateValue;
    const date = new Date(datePart + 'T00:00:00');

    if (isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const displayValue = props.value
    ? formatDate(props.value)
    : props.placeholder
      ? formatDate(props.placeholder)
      : 'Selecciona una fecha';

  const isCustomValue = Boolean(props.value);

  return (
    <div className="settings__field">
      <label className="settings__label">{props.label}</label>

      <div
        onClick={() => inputRef.current?.showPicker()}
        className={`settings__date-trigger ${isCustomValue ? 'is-active' : ''}`}
      >
        <FiCalendar className="settings__date-icon" />
        <span className="settings__date-value">{displayValue}</span>
      </div>

      <input
        ref={inputRef}
        type="date"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
        }}
      />

      {props.error && (
        <div className="settings__field-tooltip" onClick={props.onClearError}>
          <FiAlertCircle /> {props.error}
        </div>
      )}
    </div>
  );
}
