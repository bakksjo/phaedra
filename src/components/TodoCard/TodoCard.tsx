import { TodoItem, TodoState } from '../../phaedra.types';
import './TodoCard.css';

interface TodoCardProps {
  todo: TodoItem;
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
        <span className="todo-card-title">{todo.title}</span>
        <div>
          <span className="todo-card-state-text">{todo.state}</span>
          <span className="todo-card-state-icon">{getStateIcon(todo.state)}</span>
        </div>
      </div>
      <div className="todo-card-footer">
        <span className="todo-card-created-by">Created by: {todo.createdByUser}</span>
        <span className="todo-card-time">Last Modified: {new Date(todo.lastModifiedTime).toLocaleString()}</span>
      </div>
    </div>
  );
};
