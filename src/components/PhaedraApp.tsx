import { useState } from 'react';
import { TodoList } from './TodoList';
import { UsernameInput } from './UsernameInput';

interface IPhaedraAppProps {
  initialUsername?: string;
}

interface IPhaedraAppState {
  username: string | null;
}

export const PhaedraApp = ({ initialUsername }: IPhaedraAppProps) => {
  const [state, setState] = useState<IPhaedraAppState>({
    username: initialUsername || null,
  });

  const handleUsernameSubmit = (username: string) => {
    setState((prevState) => ({ ...prevState, username }));
  };

  const listName = 'default'; // TODO: Hardcoded for now.

  return (
    <div className="todo-list">
      {!state.username ? (
        <UsernameInput onSubmit={handleUsernameSubmit} />
      ) : (
        <>
          <span>Welcome, {state.username}.</span>
          <h2>Todo List: {listName}</h2>
          <TodoList listName={listName}/>
        </>
      )}
    </div>
  );
};
