import { useEffect, useRef, useState } from 'react';
import './TextInput.css';

interface TextInputProps {
  value?: string;
  placeholder?: string;
  trimmer?: (value: string) => string;
  validator?: (value: string) => boolean;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
}

export const TextInput = ({
  value: initialValue = '',
  placeholder,
  trimmer,
  validator,
  onSubmit, 
  onCancel
}: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const isValid = validator ? validator(currentValue) : true;

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }
    onSubmit(currentValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (onCancel && event.key === 'Escape') {
      setCurrentValue('');
      onCancel();
    }
  };

  return (
    <div className="text-input-container">
      <input
        ref={inputRef}
        className="text-input-field"
        data-testid="text-input"
        type="text"
        value={currentValue}
        autoFocus
        onChange={(e) => setCurrentValue(trimmer ? trimmer(e.target.value) : e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      <button
        className="text-input-button text-input-submit-button"
        data-testid="text-input-submit-button"
        onClick={handleSubmit}
        disabled={!isValid}
      >
        ✓
      </button>
      {onCancel && (
        <button
          className="text-input-button text-input-cancel-button"
          data-testid="text-input-cancel-button"
          onClick={onCancel}
        >
          ✗
        </button>
      )}
    </div>
  );
};
