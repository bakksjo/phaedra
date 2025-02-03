import React, { useState } from 'react';
import { StoredTodoItem, TodoState } from '../../phaedra.types';
import './TodoCard.css';

interface TodoCardProps {
  listName: string;
  todo: StoredTodoItem;
}

type PendingUpdateState = {
  previousTodo: StoredTodoItem;
} | undefined;

export const TodoCard = ({ listName, todo: initialTodo }: TodoCardProps) => {
  const [todo, setTodo] = useState(initialTodo);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdateState>(undefined);
  const [newTitle, setNewTitle] = useState(todo.data.title);

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
    if (pendingUpdate) return;

    setIsEditing(true);
  };

  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const submitTitleInputChange = async () => {
    setIsEditing(false);
    if (newTitle === todo.data.title) {
      return;
    }
    setPendingUpdate({ previousTodo: todo });
    const updatedTodo = { ...todo.data, title: newTitle };
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
      if (!response.ok) {
        throw new Error("Failed to update TODO item");
      }
      const updatedTodoItem: StoredTodoItem = await response.json();
      setTodo(updatedTodoItem);
    } catch (error) {
      console.error(error);
      if (pendingUpdate) {
        // The update failed, so revert the UI to the previous state.
        setTodo(pendingUpdate.previousTodo);
      }
    } finally {
      setPendingUpdate(undefined);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
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
    <div className={`todo-card ${pendingUpdate ? 'pending-update' : ''}`}>
      <div className="todo-card-header">
        {isEditing ? (
          <input
            type="text"
            value={newTitle}
            onChange={handleTitleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={cancelEditing}
            autoFocus
            disabled={!!pendingUpdate}
            className="todo-card-input"
          />
        ) : (
          <span className="todo-card-title" onClick={handleTitleClick}>
            {todo.data.title}
          </span>
        )}
        <div>
          <span className="todo-card-state-text">{todo.data.state}</span>
          <span className="todo-card-state-icon">{getStateIcon(todo.data.state)}</span>
        </div>
      </div>
      <div className="todo-card-footer">
        <span className="todo-card-created-by">Created by: {todo.data.createdByUser}</span>
        <span className="todo-card-time">Last Modified: {new Date(todo.meta.lastModifiedTime).toLocaleString()}</span>
      </div>
      {pendingUpdate && <div className="spinner-container"><div className="spinner"></div></div>}
    </div>
  );
};
