import { useState } from 'react';
import { TodoList } from './TodoList';
import { UsernameInput } from './UsernameInput';

interface IPhaedraAppState {
  username: string | null;
}

const initialState: IPhaedraAppState = {
  username: null,
};

export const PhaedraApp = () => {
  const [state, setState] = useState<IPhaedraAppState>(initialState);

  const handleUsernameSubmit = (username: string) => {
    setState((prevState) => ({ ...prevState, username }));
  };

  return (
    <div className="todo-list">
      {!state.username ? (
        <UsernameInput onSubmit={handleUsernameSubmit} />
      ) : (
        <TodoList />
      )}
    </div>
  );
};
