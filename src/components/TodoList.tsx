import { useEffect, useState } from 'react';
import { fetchTodosResponseSchema } from '../phaedra-schemas';
import { FetchTodosResponse, TodoItem } from '../phaedra.types';
import { TodoCard } from './TodoCard/TodoCard';

const fetchTodos = async (baseUrl: string, listName: string): Promise<FetchTodosResponse> => {
  const url = `${baseUrl}todo-lists/${listName}/todos`;
  const response = await fetch(url);
  const json = await response.json();
  return fetchTodosResponseSchema.parse(json);
};

interface ITodoListProps { 
  listName: string;
}

export const TodoList = ({ listName }: ITodoListProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTodos = async () => {
    try {
      const todos = await fetchTodos('http://localhost:3001/', listName);
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
      {loading && <span>Loading TODO list: {listName}</span>}

      {todos.length === 0 && !loading ? (
        <span>No todos found</span>
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