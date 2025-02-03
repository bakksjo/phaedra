import { StoredTodoItem, TodoState } from '../../phaedra.types';
import './TodoCard.css';

interface TodoCardProps {
  todo: StoredTodoItem;
}

export const TodoCard = ({ todo }: TodoCardProps) => {
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

  return (
    <div className="todo-card">
      <div className="todo-card-header">
        <span className="todo-card-title">{todo.data.title}</span>
        <div>
          <span className="todo-card-state-text">{todo.data.state}</span>
          <span className="todo-card-state-icon">{getStateIcon(todo.data.state)}</span>
        </div>
      </div>
      <div className="todo-card-footer">
        <span className="todo-card-created-by">Created by: {todo.data.createdByUser}</span>
        <span className="todo-card-time">Last Modified: {new Date(todo.meta.lastModifiedTime).toLocaleString()}</span>
      </div>
    </div>
  );
};
