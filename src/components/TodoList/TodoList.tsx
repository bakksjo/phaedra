import { useEffect, useState } from 'react';
import { zStoreTodoEvent } from '../../phaedra-schemas';
import { StoreTodoEvent, TodoState } from '../../phaedra.types';
import { TodoItem, TodoCard } from '../TodoCard/TodoCard';
import { StateFilterSelector } from '../StateFilterSelector/StateFilterSelector';
import './TodoList.css';

interface ITodoListProps { 
  listName: string;
  username: string;
}

export const TodoList = ({ listName, username }: ITodoListProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedStates, setSelectedStates] = useState<TodoState[]>(['TODO', 'ONGOING', 'DONE']);
  const [liveUpdate, setLiveUpdate] = useState<boolean>(true);

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:3001/todo-lists/${listName}/events`);

    eventSource.onmessage = (event) => {
      if (!liveUpdate) return;

      const eventDataObject = JSON.parse(event.data);
      const storeEvent: StoreTodoEvent = zStoreTodoEvent.parse(eventDataObject);

      // Using this function to guarantee (statically) that all event types are handled. No 'default' case needed.
      type UpdateHandler = () => void;
      const getUpdateHandlerForEvent = (): UpdateHandler => {
        switch(storeEvent.type) {
          case 'update':
            return (): void => onUpdateItem({ type: 'stored', data: storeEvent.todo.data, meta: storeEvent.todo.meta });

          case 'delete':
            return (): void => onRemoveItem(storeEvent.id);
        }
      };

      const updateHandler = getUpdateHandlerForEvent();
      updateHandler();
    };

    return () => {
      eventSource.close();
    };
  }, [listName, liveUpdate]);

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

  const handleStateFilterChange = (selectedStates: TodoState[]) => {
    setSelectedStates(selectedStates);
  };

  const handleLiveUpdateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLiveUpdate(event.target.checked);
  };

  const filteredTodos = todos.filter(todo => selectedStates.includes(todo.data.state));

  return (
    <div className="todo-list" data-testid="todo-list">
      <div className="todo-list-header">
        <button className="todo-list-button-add" onClick={handleAddNewTodo}>+ New item</button>
        <div className="todo-list-controls">
          <div className="todo-list-controls-liveupdate">
            <label>
              <input
                type="checkbox"
                checked={liveUpdate}
                onChange={handleLiveUpdateChange}
              />
              Live Update
            </label>
          </div>
          <div className="todo-list-controls-filter">
            <StateFilterSelector selected={selectedStates} onChange={handleStateFilterChange} />
          </div>
        </div>
      </div>
      {filteredTodos.length === 0 ? (
        <span className="todo-list-empty">{todos.length == 0 ? 'No todos in this list' : 'No todos matching filter'}</span>
      ) : (
        <div className="todo-list-items">
          {filteredTodos.map((todo) => (
            <TodoCard key={todo.meta.id} listName={listName} todo={todo} onUpdate={onUpdateItem} onRemove={onRemoveItem} />
          ))}
        </div>
      )}
    </div>
  );
};