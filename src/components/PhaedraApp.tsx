import { useEffect, useState } from 'react';
import { FetchTodosResponse, fetchTodosResponseSchema, TodoItem } from '../phaedraSchemas';

interface IPhaedraAppState {
  todos: TodoItem[];
  loading: boolean;
}

const initialState: IPhaedraAppState = {
  todos: [],
  loading: true,
};

const fetchTodos = async (url: string): Promise<FetchTodosResponse> => {
  const response = await fetch(url);
  const json = await response.json();
  return fetchTodosResponseSchema.parse(json);
};

export const PhaedraApp = () => {
  const [state, setState] = useState<IPhaedraAppState>(initialState);

  const loadTodos = async () => {
    let todos: TodoItem[];
    try {
      todos = await fetchTodos('http://localhost:3001/todos');
    } catch (err) {
      console.error('Error fetching TODOs from server:', err);
      setState((prevState) => ({ ...prevState, loading: false }));
    }

    setState((prevState) => ({ ...prevState, todos: todos, loading: false }));
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div className="todo-list">
      <h1>Todo List</h1>

      {state.loading && (
        <h2>Loading...</h2>
      )}

      {state.todos.length === 0 && !state.loading
        ? (<h2>No todos found</h2>)
        : (
          <ul>
            {state.todos.map(todo => (
              <li key={todo.id}>
                <input type="checkbox" checked={todo.completed} />
                {todo.title}
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
};
