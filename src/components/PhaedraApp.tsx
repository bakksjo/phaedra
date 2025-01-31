import { useEffect, useState } from 'react';
import { z } from 'zod';

export const PhaedraApp = () => {

  const todoSchema = z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    completed: z.boolean()
  });

  const fetchTodosSchema = z.array(todoSchema);

  type TodoItem = z.infer<typeof todoSchema>;

  interface IPhaedraAppState {
    todos: TodoItem[];
    loading: boolean;
  }

  const initialState: IPhaedraAppState = {
    todos: [],
    loading: true,
  };

  const [state, setState] = useState<IPhaedraAppState>(initialState);

  useEffect(() => {
    fetch('http://localhost:3001/todos')
      .then(response => response.json())
      .then(json => fetchTodosSchema.parse(json))
      .then(todos => setState((prevState) =>({ ...prevState, todos: todos.slice(0, 10), loading: false })))
      .catch(err => {
        console.error('Error parsing server response:', err);
        setState((prevState) => ({ ...prevState, loading: false }));
      });
  }, []);

  return (
    <div className="todo-list">
      <h1>Todo List</h1>

      {state.loading && (
        <h2>Loading...</h2>
      )}

      { state.todos.length == 0 && !state.loading
        ? ( <h2>No todos found</h2> )
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
}
