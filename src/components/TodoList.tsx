import { useEffect, useState } from 'react';
import { FetchTodosResponse, fetchTodosResponseSchema, TodoItem } from '../phaedraSchemas';
import { TodoCard } from './TodoCard';

const fetchTodos = async (url: string): Promise<FetchTodosResponse> => {
  const response = await fetch(url);
  const json = await response.json();
  return fetchTodosResponseSchema.parse(json);
};

export const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTodos = async () => {
    try {
      const todos = await fetchTodos('http://localhost:3001/todos');
      setTodos(todos);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching TODOs from server:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div data-testid="todo-list">
      <h2>Todo List</h2>

      {loading && <h2>Loading...</h2>}

      {todos.length === 0 && !loading ? (
        <h2>No todos found</h2>
      ) : (
        <div>
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
};