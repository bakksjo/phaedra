import { useState } from 'react';
import { TodoList } from '../TodoList/TodoList';
import { TextInput } from '../TextInput/TextInput';
import { TodoListSelector } from '../TodoListSelector/TodoListSelector';
import './PhaedraApp.css';

interface IPhaedraAppProps {
  initialUsername?: string;
}

const usernameTrimmer = (username: string) => username.trim();
const usernameValidator = (username: string) => username?.length > 0;

export const PhaedraApp = ({ initialUsername }: IPhaedraAppProps) => {
  const [username, setUsername] = useState<string | undefined>(initialUsername);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(!username);
  const [selectedList, setSelectedList] = useState<string>('');

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
          <TextInput value={username} placeholder='<your alias>' trimmer={usernameTrimmer} validator={usernameValidator} onSubmit={handleUsernameSubmit} onCancel={username ? cancelEditUsername : undefined} />
        )}
      </div>
      <div className="content">
        {!username ? (
          <span>Please begin by entering your alias above.</span>
        ) : (
          <>
            <TodoListSelector onSelect={setSelectedList} />
            {selectedList && (<TodoList key={selectedList} listName={selectedList} username={username} />)}
          </>
        )}
      </div>
    </div>
  );
};
