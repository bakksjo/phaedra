import React, { useState } from 'react';
import { StoredTodoItem, StoredTodoItemMetadata, TodoItemData, TodoState } from '../../phaedra.types';
import './TodoCard.css';

const availableStates: TodoState[] = ['TODO', 'ONGOING', 'DONE'];

type StoredItem = {
  type: 'stored';
  data: TodoItemData;
  meta: StoredTodoItemMetadata;
}

type EphemeralItem = {
  type: 'ephemeral';
  data: TodoItemData;
  meta: { id: string };
}

export type TodoItem = StoredItem | EphemeralItem;

interface TodoCardProps {
  listName: string;
  todo: TodoItem;
  onUpdate: (todoId: string, todo: TodoItem) => void;
  onRemove: (todoId: string) => void;
}

export const TodoCard = ({ listName, todo: initialTodo, onUpdate, onRemove }: TodoCardProps) => {
  const [todo, setTodo] = useState(initialTodo);
  const [isEditingTitle, setIsEditingTitle] = useState(todo.type === 'ephemeral');
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
    if (todo.type === 'ephemeral') return; //Don't allow editing state for new TODOs
    setIsEditingState(true);
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewState(e.target.value as TodoState);
  };

  const updateTodoState = (updatedTodo: TodoItem) => {
    const previousTodoId = todo.meta.id;
    setTodo(updatedTodo);
    onUpdate(previousTodoId, updatedTodo);
  }

  const submitChange = async (localUpdatedTodo: TodoItemData) => {
    const previousTodo = todo;
    setIsUpdatePending(true);
    updateTodoState({ ...todo, data: localUpdatedTodo });
    try {
      const request = todo.type === 'ephemeral'
        ? fetch(
            `http://localhost:3001/todo-lists/${listName}/todos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(localUpdatedTodo),
            }
          )
        : fetch(
            `http://localhost:3001/todo-lists/${listName}/todos/${todo.meta.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "If-Match": todo.meta.revision.toString(),
              },
              body: JSON.stringify(localUpdatedTodo),
            }
          );

      const response = await request;

      if (todo.type === 'stored' && response.status === 409) {
        console.log('Conflict detected, showing latest');
      } else if (!response.ok) {
        throw new Error("Failed to update TODO item");
      }
      const responseTodo: StoredTodoItem = await response.json();
      updateTodoState({ type: 'stored', data: responseTodo.data, meta: responseTodo.meta });
    } catch (error) {
      console.error(error);
      // The update failed, so revert the UI to the previous state.
      updateTodoState(previousTodo);
      if (todo.type === 'ephemeral') onRemove(todo.meta.id); // TODO: Show error and allow retry instead of removing.
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

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setNewTitle(todo.data.title);
    if (todo.type === 'ephemeral') onRemove(todo.meta.id);
  }

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await submitTitleInputChange();
    } else if (e.key === 'Escape') {
      cancelEditingTitle();
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
            onBlur={cancelEditingTitle}
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
      {todo.type === 'stored' && (
        <div className="todo-card-footer">
          <span className="todo-card-created-by">Created by: {todo.data.createdByUser}</span>
          <span className="todo-card-time">Last Modified: {new Date(todo.meta.lastModifiedTime).toLocaleString()}</span>
        </div>
      )}
      {isUpdatePending && <div className="spinner-container"><div className="spinner"></div></div>}
    </div>
  );
};
