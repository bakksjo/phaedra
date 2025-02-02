import { TodoItem } from '../phaedra.types';

interface TodoCardProps {
  todo: TodoItem;
}

export const TodoCard = ({ todo }: TodoCardProps) => {
  return (
    <div className="todo-card">
      <input type="checkbox" checked={todo.state === 'DONE'} readOnly />
      <span>{todo.title}</span>
      <span> (State: {todo.state}, Last Modified: {new Date(todo.lastModifiedTime).toLocaleString()})</span>
    </div>
  );
};