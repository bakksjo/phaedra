import { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoList } from './TodoList';

// Mock the fetch function to simulate a successful response with some TODOs.
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { userId: 1, id: 1, title: "Test TODO 1", completed: false },
      { userId: 1, id: 2, title: "Test TODO 2", completed: true },
    ]),
  })
) as jest.Mock;

describe('TodoList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('the loading screen is shown initially', async () => {
    render(<TodoList />);

    expect(screen.queryByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Test TODO 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test TODO 2')).not.toBeInTheDocument();
  });

  test('shows TODOs after loading', async () => {
    await act(async () => {
      render(<TodoList />);
    });
  
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Test TODO 1')).toBeInTheDocument();
    expect(screen.queryByText('Test TODO 2')).toBeInTheDocument();
  });
});