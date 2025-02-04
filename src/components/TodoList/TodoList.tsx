import { useEffect, useState } from 'react';
import { zFetchTodosResponse } from '../../phaedra-schemas';
import { FetchTodosResponse } from '../../phaedra.types';
import { TodoItem, TodoCard } from '../TodoCard/TodoCard';
import './TodoList.css';

const fetchTodos = async (baseUrl: string, listName: string): Promise<FetchTodosResponse> => {
  const url = `${baseUrl}todo-lists/${listName}/todos`;
  const response = await fetch(url);
  const json = await response.json();
  return zFetchTodosResponse.parse(json);
};

interface ITodoListProps { 
  listName: string;
  username: string;
}

export const TodoList = ({ listName, username }: ITodoListProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTodos = async () => {
    try {
      const todos = await fetchTodos('http://localhost:3001/', listName);
      setTodos(todos.map(todo => ({ type: 'stored', data: todo.data, meta: todo.meta })));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching TODOs from server:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [listName]);

  const handleAddNewTodo = () => {
    const newTodoItem: TodoItem = {
      type: 'ephemeral',
      data: {
        title: '',
        createdByUser: username,
        state: 'TODO',
      },
      meta: {
        id: self.crypto.randomUUID(),
      },
    };
    setTodos([newTodoItem, ...todos]);
  };

  const onRemoveItem = (todoId: string) => {
    setTodos(todos.filter(todo => todo.meta.id !== todoId));
  }

  const onUpdateItem = (todoId: string, updatedTodo: TodoItem) => {
    setTodos(todos.map(currentTodo => currentTodo.meta.id === todoId ? updatedTodo : currentTodo));
  }

  return (
    <div className="todo-list" data-testid="todo-list">
      {loading && <span className="todo-list-loading">Loading TODO list: {listName}</span>}

      <button className="add-todo-button" onClick={handleAddNewTodo}>+</button>
      {todos.length === 0 && !loading ? (
        <span className="todo-list-empty">No todos found</span>
      ) : (
        <div className="todo-list-items">
          {todos.map((todo) => (
            <TodoCard key={todo.meta.id} listName={listName} todo={todo} onUpdate={onUpdateItem} onRemove={onRemoveItem} />
          ))}
        </div>
      )}
    </div>
  );
};