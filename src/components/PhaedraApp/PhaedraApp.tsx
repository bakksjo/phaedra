import { useState } from 'react';
import { TodoList } from '../TodoList/TodoList';
import { UsernameInput } from '../UsernameInput/UsernameInput';
import './PhaedraApp.css';

interface IPhaedraAppProps {
  initialUsername?: string;
}

export const PhaedraApp = ({ initialUsername }: IPhaedraAppProps) => {
  const [username, setUsername] = useState<string | undefined>(initialUsername);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(!username);

  const handleUsernameSubmit = (username: string) => {
    setUsername(username);
    setIsEditingUsername(false);
  };

  const handleUsernameClick = () => {
    setIsEditingUsername(true);
  };

  const cancelEditUsername = () => {
    setIsEditingUsername(false);
  }

  const listName = 'default'; // TODO: Hardcoded for now.

  return (
    <div className="phaedra-app">
      <div className="top-bar">
        <span className="title">Phaedra task management</span>
        {username && !isEditingUsername && (
          <div className="user-info">
            <span className="username" onClick={handleUsernameClick}>{username}</span>
            <span className="profile-icon">👤</span>
          </div>
        )}
        {isEditingUsername && (
          <UsernameInput onSubmit={handleUsernameSubmit} initialValue={username} onCancel={username ? cancelEditUsername : undefined} />
        )}
      </div>
      <div className="content">
        {!username ? (
          <span>Please enter your alias above.</span>
        ) : (
          <TodoList listName={listName} />
        )}
      </div>
    </div>
  );
};
