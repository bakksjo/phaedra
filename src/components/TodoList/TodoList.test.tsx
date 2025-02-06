import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoList } from './TodoList';
import { StoreEvent, StoredTodoItem } from '../../phaedra.types';
import { v4 as uuidv4 } from 'uuid';

const mockTodoId = uuidv4();
const mockV1Todo: StoredTodoItem = {
  data: {
    title: 'Test TODO 1',
    state: 'TODO',
    createdByUser: 'user1',
  },
  meta: {
    id: mockTodoId,
    lastModifiedTime: new Date().toISOString(),
    revision: 1,
  }
};

const mockV2Todo: StoredTodoItem = {
  data: {
    title: 'Updated TODO 1',
    state: 'ONGOING',
    createdByUser: 'user1',
  },
  meta: {
    id: mockTodoId,
    lastModifiedTime: new Date().toISOString(),
    revision: 2,
  }
};

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

const dispatchStoreEvent = (event: StoreEvent) => {
  act(() => {
    MockEventSource.instances[0].dispatchEvent(JSON.stringify(event));
  });
};

describe('TodoList', () => {
  afterEach(() => {
    jest.clearAllMocks();
    MockEventSource.instances = [];
  });

  test('adds TODO items when receiving update events for new todos', async () => {
    render(<TodoList listName="whatever" username="someone" />);

    expect(screen.queryByTestId('todo-card')).not.toBeInTheDocument();

    dispatchStoreEvent({ type: 'update', todo: mockV1Todo });

    await screen.findByText(mockV1Todo.data.title);

    expect(screen.queryAllByTestId('todo-card')).toHaveLength(1);
  });

  test('updates TODO items when receiving update events for existing todos', async () => {
    render(<TodoList listName="whatever" username="someone" />);

    expect(screen.queryByTestId('todo-card')).not.toBeInTheDocument();

    dispatchStoreEvent({ type: 'update', todo: mockV1Todo });
    dispatchStoreEvent({ type: 'update', todo: mockV2Todo });

    await screen.findByText(mockV2Todo.data.title);

    expect(screen.queryAllByTestId('todo-card')).toHaveLength(1);
    expect(screen.queryByText(mockV1Todo.data.title)).not.toBeInTheDocument();
  });

  test('shows each TODO after receiving multiple updates', async () => {
    render(<TodoList listName="whatever" username="someone" />);

    expect(screen.queryByTestId('todo-card')).not.toBeInTheDocument();

    const anotherTodo: StoredTodoItem = {
      data: { ...mockV1Todo.data, title: 'A different title' },
      meta: { ...mockV1Todo.meta, id: uuidv4() },
    };

    dispatchStoreEvent({ type: 'update', todo: mockV1Todo });
    dispatchStoreEvent({ type: 'update', todo: anotherTodo });

    await screen.findByText(anotherTodo.data.title);

    expect(screen.queryAllByTestId('todo-card')).toHaveLength(2);
  });

  test('deletes TODO items when receiving delete events', async () => {
    render(<TodoList listName="whatever" username="someone" />);

    dispatchStoreEvent({ type: 'update', todo: mockV1Todo });

    await screen.findByText(mockV1Todo.data.title);

    expect(screen.queryAllByTestId('todo-card')).toHaveLength(1);

    dispatchStoreEvent({ type: 'delete', id: mockV1Todo.meta.id });

    await waitFor(() => expect(screen.queryByText(mockV1Todo.data.title)).not.toBeInTheDocument());
    expect(screen.queryAllByTestId('todo-card')).toHaveLength(0);
  });
});
