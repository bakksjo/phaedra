import { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoList } from './TodoList'
import { FetchTodosResponse } from '../../phaedra.types';
import { v4 as uuidv4 } from 'uuid';

const mockTodos: FetchTodosResponse = [
  {
    data: {
      title: 'Test TODO 1',
      state: 'TODO',
      createdByUser: 'user1',
    },
    meta: {
      id: uuidv4(),
      lastModifiedTime: new Date().toISOString(),
      revision: 1,
    }
  },
  {
    data: {
      title: 'Test TODO 2',
      state: 'DONE',
      createdByUser: 'user2',
    },
    meta: {
      id: uuidv4(),
      lastModifiedTime: new Date().toISOString(),
      revision: 3,
    }
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
    render(<TodoList listName="whatever" />);

    expect(screen.queryByText(/Loading/)).toBeInTheDocument();
    expect(screen.queryByText('Test TODO 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test TODO 2')).not.toBeInTheDocument();
  });

  test('shows TODOs after loading', async () => {
    await act(async () => {
      render(<TodoList listName="doesn't matter" />);
    });
  
    expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Test TODO 1/)).toBeInTheDocument();
    expect(screen.queryByText(/Test TODO 2/)).toBeInTheDocument();
  });
});