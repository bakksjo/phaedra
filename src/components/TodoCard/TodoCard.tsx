import React, { useState } from 'react';
import { StoredTodoItem, TodoItemData, TodoState } from '../../phaedra.types';
import './TodoCard.css';

interface TodoCardProps {
  listName: string;
  todo: StoredTodoItem;
}

const availableStates: TodoState[] = ['TODO', 'ONGOING', 'DONE'];

export const TodoCard = ({ listName, todo: initialTodo }: TodoCardProps) => {
  const [todo, setTodo] = useState(initialTodo);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingState, setIsEditingState] = useState(false);
  const [isUpdatePending, setIsUpdatePending] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.data.title);
  const [newState, setNewState] = useState(todo.data.state);

  const getStateIcon = (state: TodoState): string => {
    switch (state) {
      case 'DONE':
        return '✅';
      case 'ONGOING':
        return '🔄';
      case 'TODO':
        return '📝';
    }
  };

  const handleTitleClick = () => {
    if (isUpdatePending) return;
    setIsEditingTitle(true);
  };

  const handleStateClick = () => {
    if (isUpdatePending) return;
    setIsEditingState(true);
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewState(e.target.value as TodoState);
  };

  const submitChange = async (updatedTodo: TodoItemData) => {
    const previousTodo = todo;
    setIsUpdatePending(true);
    const temporaryPresumedMeta = { ...todo.meta, revision: todo.meta.revision + 1, lastModifiedTime: new Date().toISOString() };
    const localTodoWhilePendingUpdate = { data: updatedTodo, meta: temporaryPresumedMeta };
    setTodo(localTodoWhilePendingUpdate);
    try {
      const response = await fetch(
        `http://localhost:3001/todo-lists/${listName}/todos/${todo.meta.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "If-Match": todo.meta.revision.toString(),
          },
          body: JSON.stringify(updatedTodo),
        }
      );
      if (response.status === 409) {
        console.log('Conflict detected, showing latest');
      } else if (!response.ok) {
        throw new Error("Failed to update TODO item");
      }
      const updatedTodoItem: StoredTodoItem = await response.json();
      setTodo(updatedTodoItem);
    } catch (error) {
      console.error(error);
      // The update failed, so revert the UI to the previous state.
      setTodo(previousTodo);
    } finally {
      setIsUpdatePending(false);
    }
  };

  const submitTitleInputChange = async () => {
    setIsEditingTitle(false);
    if (newTitle === todo.data.title) {
      return;
    }
    const updatedTodo = { ...todo.data, title: newTitle };
    await submitChange(updatedTodo);
  };

  const submitStateChange = async () => {
    setIsEditingState(false);
    if (newState === todo.data.state) {
      return;
    }
    const updatedTodo = { ...todo.data, state: newState };
    await submitChange(updatedTodo);
  };

  const cancelEditing = () => {
    setIsEditingTitle(false);
    setNewTitle(todo.data.title);
  }

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await submitTitleInputChange();
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  };

  return (
    <div className={`todo-card ${isUpdatePending ? 'pending-update' : ''}`}>
      <div className="todo-card-header">
        {isEditingTitle ? (
          <input
            type="text"
            value={newTitle}
            onChange={handleTitleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={cancelEditing}
            autoFocus
            disabled={!!isUpdatePending}
            className="todo-card-input"
          />
        ) : (
          <span className="todo-card-title" onClick={handleTitleClick}>
            {todo.data.title}
          </span>
        )}
        <div>
          {isEditingState ? (
            <select
              value={newState}
              onChange={handleStateChange}
              onBlur={submitStateChange}
              disabled={!!isUpdatePending}
              className="todo-card-select"
            >
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          ) : (
            <>
              <span className="todo-card-state-text" onClick={handleStateClick}>
                {todo.data.state}
              </span>
              <span className="todo-card-state-icon" onClick={handleStateClick}>
                {getStateIcon(todo.data.state)}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="todo-card-footer">
        <span className="todo-card-created-by">Created by: {todo.data.createdByUser}</span>
        <span className="todo-card-time">Last Modified: {new Date(todo.meta.lastModifiedTime).toLocaleString()}</span>
      </div>
      {isUpdatePending && <div className="spinner-container"><div className="spinner"></div></div>}
    </div>
  );
};
