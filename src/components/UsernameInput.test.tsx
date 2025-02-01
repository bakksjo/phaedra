import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UsernameInput } from './UsernameInput';

const TEST_IDS = {
  input: 'username-input',
  button: 'username-submit-button',
};

const VALID_USERNAME = 'validUsername';

describe('UsernameInput', () => {
  test('renders the input and submit button', () => {
    render(<UsernameInput onSubmit={jest.fn()} />);

    expect(screen.getByTestId(TEST_IDS.input)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.button)).toBeInTheDocument();
  });

  test('enables the submit button when input is valid', () => {
    render(<UsernameInput onSubmit={jest.fn()} />);

    const input = screen.getByTestId(TEST_IDS.input);
    const button = screen.getByTestId(TEST_IDS.button);
    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: VALID_USERNAME } });

    expect(button).toBeEnabled();
  });

  test('disables the submit button when input is invalid', () => {
    render(<UsernameInput onSubmit={jest.fn()} />);

    const input = screen.getByTestId(TEST_IDS.input);
    const button = screen.getByTestId(TEST_IDS.button);

    fireEvent.change(input, { target: { value: '  ' } });

    expect(button).toBeDisabled();
  });

  test('calls onSubmit with the correct username when form is submitted', () => {
    const mockOnSubmit = jest.fn();
    render(<UsernameInput onSubmit={mockOnSubmit} />);

    const input = screen.getByTestId(TEST_IDS.input);
    const button = screen.getByTestId(TEST_IDS.button);

    fireEvent.change(input, { target: { value: VALID_USERNAME } });
    fireEvent.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith(VALID_USERNAME);
  });

  test('does not call onSubmit when input is invalid', () => {
    const mockOnSubmit = jest.fn();
    render(<UsernameInput onSubmit={mockOnSubmit} />);

    const button = screen.getByTestId(TEST_IDS.button);

    fireEvent.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});