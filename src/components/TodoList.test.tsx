import { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoList } from './TodoList';
import { FetchTodosResponse } from '../phaedra.types';
import { v4 as uuidv4 } from 'uuid';

const mockTodos: FetchTodosResponse = [
  {
    createdByUser: 'user1',
    id: uuidv4(),
    lastModifiedTime: new Date().toISOString(),
    state: 'TODO',
    title: 'Test TODO 1',
  },
  {
    createdByUser: 'user2',
    id: uuidv4(),
    lastModifiedTime: new Date().toISOString(),
    state: 'DONE',
    title: 'Test TODO 2',
  },
];

// Mock the fetch function to simulate a successful response with some TODOs
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockTodos),
  })
) as jest.Mock;

describe('TodoList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('the loading screen is shown initially', () => {
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
    expect(screen.queryByText(/Test TODO 1/)).toBeInTheDocument();
    expect(screen.queryByText(/Test TODO 2/)).toBeInTheDocument();
  });
});