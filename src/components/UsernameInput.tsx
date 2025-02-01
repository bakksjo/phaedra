import { useState } from 'react';

interface IUsernameInputProps {
  onSubmit: (username: string) => void;
}

export const UsernameInput = ({ onSubmit }: IUsernameInputProps) => {
  const [currentValue, setCurrentValue] = useState<string>('');

  const isValid = currentValue?.length > 0;

  const handleSubmit = () => {
    if (!isValid) {
      return;
    }
    onSubmit(currentValue);
  };

  return (
    <div>
      <input
        data-testid="username-input"
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value.trim())}
        placeholder="Enter your username"
      />
      <button
        data-testid="username-submit-button"
        onClick={handleSubmit}
        disabled={!isValid}
      >
        Submit
      </button>
    </div>
  );
};