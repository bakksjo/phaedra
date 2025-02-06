import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoListSelector } from './TodoListSelector';
import { StoreListEvent } from '../../phaedra.types';

class MockEventSource {
  onmessage: ((event: { data: string }) => void) | null = null;
  static instances: MockEventSource[] = [];

  constructor(url: string) {
    MockEventSource.instances.push(this);
  }

  dispatchEvent(eventData: string ) {
    if (!this.onmessage) throw new Error('No event listener registered');
    this.onmessage({ data: eventData });
  }

  close() {
    // Clean up if necessary
  }
}

global.EventSource = MockEventSource as any;

const dispatchStoreEvent = (event: StoreListEvent) => {
  act(() => {
    MockEventSource.instances[0].dispatchEvent(JSON.stringify(event));
  });
};

describe('TodoListSelector', () => {
  afterEach(() => {
    jest.clearAllMocks();
    MockEventSource.instances = [];
  });

  test('renders a list of available TODO lists from SSE', async () => {
    render(<TodoListSelector onSelect={jest.fn()} />);

    dispatchStoreEvent({ type: 'created', list: 'List 1'});
    dispatchStoreEvent({ type: 'created', list: 'List 2'});
    dispatchStoreEvent({ type: 'created', list: 'List 3'});

    await screen.findByText('List 3');

    expect(screen.getByText('List 1')).toBeInTheDocument();
    expect(screen.getByText('List 2')).toBeInTheDocument();
    expect(screen.getByText('List 3')).toBeInTheDocument();
  });

  test('the first list received is selected by default', async () => {
    const onSelect = jest.fn();
    render(<TodoListSelector onSelect={onSelect} />);

    dispatchStoreEvent({ type: 'created', list: 'List 1'});
    dispatchStoreEvent({ type: 'created', list: 'List 2'});

    await screen.findByText('List 2');

    expect(onSelect).toHaveBeenCalledWith('List 1');
    expect(onSelect).not.toHaveBeenCalledWith('List 2');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('calls onSelect with the correct list name when a list is clicked', async () => {
    const onSelect = jest.fn();
    render(<TodoListSelector onSelect={onSelect} />);

    dispatchStoreEvent({ type: 'created', list: 'List 1'});
    dispatchStoreEvent({ type: 'created', list: 'List 2'});

    await screen.findByText('List 2');

    fireEvent.click(screen.getByText('List 2'));
    expect(onSelect).toHaveBeenCalledWith('List 2');
  });

  test('deleting a list does not affect the selected list', async () => {
    const onSelect = jest.fn();
    render(<TodoListSelector onSelect={onSelect} />);

    dispatchStoreEvent({ type: 'created', list: 'List 1'});
    dispatchStoreEvent({ type: 'created', list: 'List 2'});

    await screen.findByText('List 2');

    expect(onSelect).toHaveBeenCalledWith('List 1');
    expect(onSelect).toHaveBeenCalledTimes(1);

    dispatchStoreEvent({ type: 'deleted', list: 'List 2' });

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('deleting the selected list selects the first list', async () => {
    const onSelect = jest.fn();
    render(<TodoListSelector onSelect={onSelect} />);

    dispatchStoreEvent({ type: 'created', list: 'List 1'});
    dispatchStoreEvent({ type: 'created', list: 'List 2'});

    await screen.findByText('List 2');

    expect(onSelect).toHaveBeenCalledWith('List 1');
    expect(onSelect).toHaveBeenCalledTimes(1);

    dispatchStoreEvent({ type: 'deleted', list: 'List 1' });

    await waitFor(() => expect(screen.queryByText('List 1')).not.toBeInTheDocument());

    expect(onSelect).toHaveBeenCalledWith('List 2');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  test('deleting the last list clears the selection', async () => {
    const onSelect = jest.fn();
    render(<TodoListSelector onSelect={onSelect} />);

    dispatchStoreEvent({ type: 'created', list: 'List 1'});

    await screen.findByText('List 1');

    expect(onSelect).toHaveBeenCalledWith('List 1');
    expect(onSelect).toHaveBeenCalledTimes(1);

    dispatchStoreEvent({ type: 'deleted', list: 'List 1' });

    await waitFor(() => expect(screen.queryByText('List 1')).not.toBeInTheDocument());

    expect(onSelect).toHaveBeenCalledWith('');
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
