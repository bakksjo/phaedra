import { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhaedraApp } from './PhaedraApp';

// Mock the fetch function to simulate a successful response with some TODOs.
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

  test('the app starts by showing the username input component', async () => {
    render(<PhaedraApp />);

    expect(screen.getByTestId('username-input')).toBeInTheDocument();
  });
});