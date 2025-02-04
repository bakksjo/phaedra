import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoCard, TodoItem } from './TodoCard';
import { v4 as uuidv4 } from 'uuid';

const mockSpecificTime = '2023-01-01T12:00:00Z';
const mockTodo: TodoItem = {
  'type': 'stored',
  data: {
    title: 'Test TODO',
    state: 'TODO',
    createdByUser: 'user1',
  },
  meta: {
    id: uuidv4(),
    lastModifiedTime: mockSpecificTime,
    revision: 1,
  }
};
const mockOnUpdate = jest.fn();
const mockOnRemove = jest.fn();

describe('TodoCard', () => {
  test('renders the todo card', () => {
    render(<TodoCard listName='default' todo={mockTodo} onUpdate={mockOnUpdate} onRemove={mockOnRemove} />);

    // Check that the title is rendered
    expect(screen.queryByText(mockTodo.data.title)).toBeInTheDocument();

    // Check that the state is rendered
    expect(screen.queryByText(mockTodo.data.state)).toBeInTheDocument();

    // Check that the last modified time is rendered
    expect(screen.queryByText(/Last Modified:/)).toBeInTheDocument();
  });

  test('renders the correct last modified time', () => {
    render(<TodoCard listName='default' todo={mockTodo} onUpdate={mockOnUpdate} onRemove={mockOnRemove} />);

    // Check that the last modified time is rendered correctly
    expect(screen.queryByText(new RegExp(new Date(mockSpecificTime).toLocaleString()))).toBeInTheDocument();
  });
});