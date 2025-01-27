import { useEffect, useState } from 'react';

export const PhaedraApp = () => {

  interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  }

  interface IPhaedraAppState {
    todos: Todo[];
    loading: boolean;
  }

  const initialState: IPhaedraAppState = {
    todos: [],
    loading: true,
  };

  const [state, setState] = useState<IPhaedraAppState>(initialState);

  useEffect(() => {
    fetch('http://localhost:3001/todos')
      .then(response => response.json() as Promise<Todo[]>)
      .then(todos => setState((prevState) =>({ ...prevState, todos: todos.slice(0, 10), loading: false })))
      .catch(err => console.log(err));
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
