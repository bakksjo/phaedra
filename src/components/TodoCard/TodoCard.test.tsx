import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoCard } from './TodoCard';
import { TodoItem } from '../../phaedra.types';

const mockTodo: TodoItem = {
  createdByUser: 'user1',
  id: '1',
  lastModifiedTime: new Date().toISOString(),
  state: 'TODO',
  title: 'Test TODO',
};

describe('TodoCard', () => {
  test('renders the todo card', () => {
    render(<TodoCard todo={mockTodo} />);

    // Check that the title is rendered
    expect(screen.queryByText(mockTodo.title)).toBeInTheDocument();

    // Check that the state is rendered
    expect(screen.queryByText(mockTodo.state)).toBeInTheDocument();

    // Check that the last modified time is rendered
    expect(screen.queryByText(/Last Modified:/)).toBeInTheDocument();
  });

  test('renders the correct last modified time', () => {
    const specificTime = '2023-01-01T12:00:00Z';
    const todoWithSpecificTime = { ...mockTodo, lastModifiedTime: specificTime };
    render(<TodoCard todo={todoWithSpecificTime} />);

    // Check that the last modified time is rendered correctly
    expect(screen.queryByText(new RegExp(new Date(specificTime).toLocaleString()))).toBeInTheDocument();
  });
});