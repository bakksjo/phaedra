import { useEffect, useState } from 'react';
import './TodoListSelector.css';

interface TodoListSelectorProps {
  onSelect: (listName: string) => void;
}

export const TodoListSelector = ({ onSelect }: TodoListSelectorProps) => {
  const [listNames, setListNames] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');

  useEffect(() => {
    // Fetch the available list names from the server
    const fetchListNames = async () => {
      try {
        const response = await fetch('http://localhost:3001/todo-lists');
        const data: string[] = await response.json();
        setListNames(data);
        if (data.length > 0) {
          setSelectedList(data[0]);
          onSelect(data[0]);
        }
      } catch (error) {
        console.error('Error fetching list names:', error);
      }
    };

    fetchListNames();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newList = event.target.value;
    setSelectedList(newList);
    onSelect(newList);
  };

  return (
    <div className="todo-list-selector">
      <label htmlFor="todo-list-selector" className="selector-label">List:</label>
      <select
        id="todo-list-selector"
        value={selectedList}
        onChange={handleChange}
        className="selector-dropdown"
      >
        {listNames.map((listName) => (
          <option key={listName} value={listName}>
            {listName}
          </option>
        ))}
      </select>
    </div>
  );
};