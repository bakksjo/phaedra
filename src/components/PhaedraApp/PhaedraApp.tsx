import { useState } from 'react';
import { TodoList } from '../TodoList/TodoList';
import { UsernameInput } from '../UsernameInput/UsernameInput';
import './PhaedraApp.css';

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
    <div className="phaedra-app">
      <div className="top-bar">
        <span className="title">Phaedra task management</span>
        {state.username && (
          <div className="user-info">
            <span className="username">{state.username}</span>
            <span className="profile-icon">👤</span>
          </div>
        )}
      </div>
      <div className="content">
        {!state.username ? (
          <UsernameInput onSubmit={handleUsernameSubmit} />
        ) : (
          <TodoList listName={listName} />
        )}
      </div>
    </div>
  );
};
