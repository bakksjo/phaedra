import { useEffect, useState } from 'react';
import { zStoreEvent } from '../../phaedra-schemas';
import { StoreEvent } from '../../phaedra.types';
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
      const storeEvent: StoreEvent = zStoreEvent.parse(eventDataObject);

      // This is a type guard function; it guarantees statically that all event types get handled.
      type UpdateHandler = () => void;
      const getUpdateHandlerForEvent = (): UpdateHandler => {
        switch(storeEvent.type) {
          case 'update':
            return (): void => onUpdateItem({ type: 'stored', data: storeEvent.todo.data, meta: storeEvent.todo.meta });

          case 'delete':
            return (): void => onRemoveItem(storeEvent.id);
        }
      }

      const updateHandler = getUpdateHandlerForEvent();
      updateHandler();
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

  const onUpdateItem = (updatedTodo: TodoItem) => {
    setTodos(prevTodos => {
      const index = prevTodos.findIndex(todo => todo.meta.id === updatedTodo.meta.id);
      if (index < 0) {
        // New insertion
        return [updatedTodo, ...prevTodos];
      }

      // Replacement
      const updatedTodos = [...prevTodos];
      updatedTodos[index] = updatedTodo;
      return updatedTodos;
    });
  }

  return (
    <div className="todo-list" data-testid="todo-list">
      <button className="todo-list-button-add" onClick={handleAddNewTodo}>+ New item</button>
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