import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextInput } from './TextInput';

const TEST_IDS = {
  input: 'text-input',
  submitButton: 'text-input-submit-button',
};

const VALID_USERNAME = 'validUsername';
const validator = (value: string): boolean => value?.trim().length > 0;

describe('TextInput', () => {
  test('renders the input and submit button', () => {
    render(<TextInput onSubmit={jest.fn()} />);

    expect(screen.getByTestId(TEST_IDS.input)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.submitButton)).toBeInTheDocument();
  });

  test('enables the submit button when input is valid', () => {
    render(<TextInput onSubmit={jest.fn()} validator={validator} />);

    const input = screen.getByTestId(TEST_IDS.input);
    const submitButton = screen.getByTestId(TEST_IDS.submitButton);
    expect(submitButton).toBeDisabled();

    fireEvent.change(input, { target: { value: VALID_USERNAME } });

    expect(submitButton).toBeEnabled();
  });

  test('disables the submit button when input is invalid', () => {
    render(<TextInput onSubmit={jest.fn()} validator={validator} />);

    const input = screen.getByTestId(TEST_IDS.input);
    const submitButton = screen.getByTestId(TEST_IDS.submitButton);

    fireEvent.change(input, { target: { value: '  ' } });

    expect(submitButton).toBeDisabled();
  });

  test('calls onSubmit with the current input value when form is submitted', () => {
    const mockOnSubmit = jest.fn();
    render(<TextInput onSubmit={mockOnSubmit} />);

    const input = screen.getByTestId(TEST_IDS.input);
    const submitButton = screen.getByTestId(TEST_IDS.submitButton);

    fireEvent.change(input, { target: { value: VALID_USERNAME } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(VALID_USERNAME);
  });

  test('does not call onSubmit when input is invalid', () => {
    const mockOnSubmit = jest.fn();
    render(<TextInput onSubmit={jest.fn()} validator={validator} />);

    const submitButton = screen.getByTestId(TEST_IDS.submitButton);

    fireEvent.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});