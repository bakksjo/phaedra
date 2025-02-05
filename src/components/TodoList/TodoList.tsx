import { useEffect, useState } from 'react';
import { zStoredTodoItem } from '../../phaedra-schemas';
import { TodoItem, TodoCard } from '../TodoCard/TodoCard';
import './TodoList.css';

interface ITodoListProps { 
  listName: string;
  username: string;
}

export const TodoList = ({ listName, username }: ITodoListProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:3001/todo-lists/${listName}/events`);

    eventSource.onmessage = (event) => {
      const eventDataObject = JSON.parse(event.data);
      const updatedTodo = zStoredTodoItem.parse(eventDataObject);
      onUpdateItem(updatedTodo.meta.id, { type: 'stored', data: updatedTodo.data, meta: updatedTodo.meta });
    };

    return () => {
      eventSource.close();
    };
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
    setTodos(prevTodos => [newTodoItem, ...prevTodos]);
  };

  const onRemoveItem = (todoId: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.meta.id !== todoId));
  }

  const onUpdateItem = (todoId: string, updatedTodo: TodoItem) => {
    setTodos(prevTodos => {
      const index = prevTodos.findIndex(todo => todo.meta.id === todoId);
      if (index >= 0) {
        const updatedTodos = [...prevTodos];
        updatedTodos[index] = updatedTodo;
        return updatedTodos;
      } else {
        return [updatedTodo, ...prevTodos];
      }
    });
  }

  return (
    <div className="todo-list" data-testid="todo-list">
      <button className="add-todo-button" onClick={handleAddNewTodo}>+</button>
      {todos.length === 0 ? (
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