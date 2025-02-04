import { useEffect, useState } from 'react';
import { zFetchTodosResponse } from '../../phaedra-schemas';
import { FetchTodosResponse, StoredTodoItem } from '../../phaedra.types';
import { TodoCard } from '../TodoCard/TodoCard';
import './TodoList.css';

const fetchTodos = async (baseUrl: string, listName: string): Promise<FetchTodosResponse> => {
  const url = `${baseUrl}todo-lists/${listName}/todos`;
  const response = await fetch(url);
  const json = await response.json();
  return zFetchTodosResponse.parse(json);
};

interface ITodoListProps { 
  listName: string;
}

export const TodoList = ({ listName }: ITodoListProps) => {
  const [todos, setTodos] = useState<StoredTodoItem[]>([]);
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
  }, [listName]);

  return (
    <div className="todo-list" data-testid="todo-list">
      {loading && <span className="todo-list-loading">Loading TODO list: {listName}</span>}

      {todos.length === 0 && !loading ? (
        <span className="todo-list-empty">No todos found</span>
      ) : (
        <div className="todo-list-items">
          {todos.map((todo) => (
            <TodoCard key={todo.meta.id} listName={listName} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
};