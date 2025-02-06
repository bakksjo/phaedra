import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StateFilterSelector } from './StateFilterSelector';
import { TodoState } from '../../phaedra.types';

const allStates: TodoState[] = ['TODO', 'ONGOING', 'DONE'];

describe('StateFilterSelector', () => {
  test('renders all available states with checkboxes', () => {
    render(<StateFilterSelector selected={[]} onChange={jest.fn()} />);

    allStates.forEach(state => {
      expect(screen.queryByLabelText(state)).toBeInTheDocument();
      expect(screen.queryByLabelText(state)).toBeInstanceOf(HTMLInputElement);
      expect(screen.queryByLabelText(state)).not.toBeChecked();
    });
  });

  test('renders selected states as checked', () => {
    render(<StateFilterSelector selected={['ONGOING', 'DONE']} onChange={jest.fn()} />);

    expect(screen.queryByLabelText('TODO')).not.toBeChecked();
    expect(screen.queryByLabelText('ONGOING')).toBeChecked();
    expect(screen.queryByLabelText('DONE')).toBeChecked();
  });

  test('calls onChange with the correct states when a checkbox is checked', () => {
    const handleChange = jest.fn();
    render(<StateFilterSelector selected={[]} onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('DONE'));
    expect(handleChange).toHaveBeenCalledWith(['DONE']);
  });

  test('calls onChange with the correct states when a checkbox is unchecked', () => {
    const handleChange = jest.fn();
    render(<StateFilterSelector selected={['TODO']} onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('TODO'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  test('calls onChange with the correct states when multiple checkboxes are checked', () => {
    const handleChange = jest.fn();
    render(<StateFilterSelector selected={['TODO']} onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('ONGOING'));
    expect(handleChange).toHaveBeenCalledWith(['TODO', 'ONGOING']);
  });

  test('calls onChange with the correct states when multiple checkboxes are unchecked', () => {
    const handleChange = jest.fn();
    render(<StateFilterSelector selected={['TODO', 'ONGOING']} onChange={handleChange} />);

    fireEvent.click(screen.getByLabelText('ONGOING'));
    expect(handleChange).toHaveBeenCalledWith(['TODO']);
  });
});