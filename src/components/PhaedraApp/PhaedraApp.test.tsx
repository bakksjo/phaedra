import { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhaedraApp } from './PhaedraApp';

jest.mock('../TodoList/TodoList', () => ({
  TodoList: () => <div data-testid="todo-list">Mocked TodoList</div>,
}));

describe('PhaedraApp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('the app starts by showing the username input component', async () => {
    render(<PhaedraApp />);

    expect(screen.queryByTestId('text-input')).toBeInTheDocument();
    expect(screen.queryByTestId('todo-list')).not.toBeInTheDocument();
  });

  test('the app shows the TODO list selector when initial username is set', async () => {
    await act(async () => {
      render(<PhaedraApp initialUsername="testuser" />);
    });

    expect(screen.queryByTestId('todo-list-selector')).toBeInTheDocument();
    expect(screen.queryByTestId('username-input')).not.toBeInTheDocument();
  });

  test('undefined initial username is handled', async () => {
    const initialUsername: string | undefined = undefined;
    await act(async () => {
      render(<PhaedraApp initialUsername={initialUsername} />);
    });

    expect(screen.queryByTestId('text-input')).toBeInTheDocument();
    expect(screen.queryByTestId('todo-list')).not.toBeInTheDocument();
  });
});