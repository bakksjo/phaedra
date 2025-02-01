import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhaedraApp } from './PhaedraApp';

// Mock the fetch function to simulate a successful response with some TODOs
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { userId: 1, id: 1, title: "Test TODO 1", completed: false },
      { userId: 1, id: 2, title: "Test TODO 2", completed: true },
    ]),
  })
) as jest.Mock;

describe('PhaedraApp', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('the loading screen is shown initially', async () => {
    render(<PhaedraApp />);

    expect(screen.queryByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Test TODO 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test TODO 2')).not.toBeInTheDocument();
  });

  test('shows TODOs after loading', async () => {
    await act(async () => {
      render(<PhaedraApp />);
    });
  
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Test TODO 1')).toBeInTheDocument();
    expect(screen.queryByText('Test TODO 2')).toBeInTheDocument();
  });
});