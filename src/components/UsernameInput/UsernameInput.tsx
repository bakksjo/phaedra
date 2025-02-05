import { useEffect, useRef, useState } from 'react';
import './UsernameInput.css';

interface UsernameInputProps {
  onSubmit: (username: string) => void;
  initialValue?: string;
  onCancel?: () => void;
}

export const UsernameInput = ({ onSubmit, initialValue = '', onCancel }: UsernameInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const isValid = currentValue?.length > 0;

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
    <div>
      <input
        ref={inputRef}
        data-testid="username-input"
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value.trim())}
        onKeyDown={handleKeyDown}
        placeholder="Enter your username"
      />
      <button
        className="username-button username-submit-button"
        data-testid="username-submit-button"
        onClick={handleSubmit}
        disabled={!isValid}
      >
        ✓
      </button>
      {onCancel && (
        <button
          className="username-button username-cancel-button"
          data-testid="username-cancel-button"
          onClick={onCancel}
        >
          ✗
        </button>
      )}
    </div>
  );
};
