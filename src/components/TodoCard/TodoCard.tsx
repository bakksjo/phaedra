import React, { useState } from 'react';
import { StoredTodoItem, StoredTodoItemMetadata, TodoItemData, TodoState } from '../../phaedra.types';
import './TodoCard.css';
import { TextInput } from '../TextInput/TextInput';

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

type ValidStateTransitions = {
  [K in TodoState]: Exclude<TodoState, K>[];
};

const validStateTransitions: ValidStateTransitions = {
  TODO: ['ONGOING'],
  ONGOING: ['DONE', 'TODO'],
  DONE: ['ONGOING'],
};

interface TodoCardProps {
  listName: string;
  todo: TodoItem;
  onUpdate: (todoId: string, todo: TodoItem) => void;
  onRemove: (todoId: string) => void;
}

const titleValidator = (title: string): boolean => !!(title.trim());

export const TodoCard = ({ listName, todo: initialTodo, onUpdate, onRemove }: TodoCardProps) => {
  const [todo, setTodo] = useState(initialTodo);
  const [isEditingTitle, setIsEditingTitle] = useState(todo.type === 'ephemeral');
  const [isEditingState, setIsEditingState] = useState(false);
  const [isUpdatePending, setIsUpdatePending] = useState(false);
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
    if (todo.type === 'ephemeral') return; // Don't allow editing state for unsaved TODOs
    setIsEditingState(true);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewState(e.target.value as TodoState);
  };

  const updateTodoState = (updatedTodo: TodoItem) => {
    setTodo(updatedTodo);
    onUpdate(todo.meta.id, updatedTodo);
  }

  const submitChange = async (localUpdatedTodo: TodoItemData) => {
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
      if (todo.type === 'ephemeral') onRemove(todo.meta.id); // TODO: Show error and allow retry instead of removing.
    } finally {
      setIsUpdatePending(false);
    }
  };

  const submitTitleInputChange = async (newTitle: string) => {
    console.log('submitTitleInputChange callback invoked')
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
    if (todo.type === 'ephemeral') onRemove(todo.meta.id);
  }

  const handleDelete = async () => {
    if (todo.type !== 'stored') throw new Error('Unreachable, should never happen');

    setIsUpdatePending(true);
    try {
      const response = await fetch(
        `http://localhost:3001/todo-lists/${listName}/todos/${todo.meta.id}`,
        {
          method: "DELETE",
          headers: {
            "If-Match": todo.meta.revision.toString(),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete TODO item. Response: ' + response.body);
      }

      onRemove(todo.meta.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatePending(false);
    }
  };

  const availableStateTransitions: TodoState[] = validStateTransitions[todo.data.state];

  return (
    <div className={`todo-card ${isUpdatePending ? 'pending-update' : ''}`}>
      <div className="todo-card-header">
        <div className="todo-card-mutable-props">
          <div className="todo-card-title-container">
            {isEditingTitle ? (
              <TextInput
                value={todo.data.title}
                placeholder="Enter title"
                validator={titleValidator}
                onSubmit={submitTitleInputChange}
                onCancel={cancelEditingTitle} />
            ) : (
              <span className="todo-card-title" onClick={handleTitleClick}>
                {todo.data.title}
              </span>
            )}
          </div>
          <div className="todo-card-state-container">
            {isEditingState ? (
              <select
                value={newState}
                onChange={handleStateChange}
                onBlur={submitStateChange}
                disabled={!!isUpdatePending}
                className="todo-card-select"
              >
                {[todo.data.state, ...availableStateTransitions].map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <div className="todo-card-state">
                <span className="todo-card-state-icon" onClick={handleStateClick}>
                  {getStateIcon(todo.data.state)}
                </span>
                <span className="todo-card-state-text" onClick={handleStateClick}>
                  {todo.data.state}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="todo-card-header-actionbox">
          {!isEditingTitle && !isEditingState && !isUpdatePending && (
            <button className="todo-card-button-delete" onClick={handleDelete} disabled={isUpdatePending}>
              <span className="todo-card-button-delete-icon">✗</span><span className="todo-card-button-delete-text">Delete</span>
            </button>
          )}
          {isUpdatePending && <div className="spinner"></div>}
        </div>
      </div>
      {todo.type === 'stored' && (
        <div className="todo-card-footer">
          <span className="todo-card-created-by">Created by: {todo.data.createdByUser}</span>
          <span className="todo-card-time">Last Modified: {new Date(todo.meta.lastModifiedTime).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

