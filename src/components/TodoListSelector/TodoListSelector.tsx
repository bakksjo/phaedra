import { useEffect, useState } from 'react';
import './TodoListSelector.css';
import { StoreListEvent } from '../../phaedra.types';
import { zStoreListEvent } from '../../phaedra-schemas';

interface TodoListSelectorProps {
  onSelect: (listName: string) => void;
}

interface ListState {
  listNames: string[];
  selectedList: string;
}

export const TodoListSelector = ({ onSelect }: TodoListSelectorProps) => {
  const [state, setState] = useState<ListState>({ listNames: [], selectedList: '' });

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:3001/todo-lists/events`);

    eventSource.onmessage = (event) => {
      const eventDataObject = JSON.parse(event.data);
      const storeEvent: StoreListEvent = zStoreListEvent.parse(eventDataObject);

      // Using this function to guarantee (statically) that all event types are handled. No 'default' case needed.
      type UpdateHandler = () => void;
      const getUpdateHandlerForEvent = (): UpdateHandler => {
        switch(storeEvent.type) {
          case 'created':
            return (): void => handleListCreated(storeEvent.list);

          case 'deleted':
            return (): void => handleListDeleted(storeEvent.list);
        }
      };

      const updateHandler = getUpdateHandlerForEvent();
      updateHandler();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleListCreated = (listName: string) => {
    setState(prevState => {
      if (prevState.listNames.includes(listName)) {
        return prevState; // Don't add duplicates
      }

      const newListNames = [...prevState.listNames, listName];
      const aListWasAlreadySelected = !!prevState.selectedList;
      const newSelectedList = aListWasAlreadySelected ? prevState.selectedList :  listName;
      if (!aListWasAlreadySelected) {
        onSelect(listName);
      }
      return { listNames: newListNames, selectedList: newSelectedList };
    });
  };

  const handleListDeleted = (listName: string) => {
    setState(prevState => {
      const newListNames = prevState.listNames.filter(name => name !== listName);
      const selectedListWasDeleted = prevState.selectedList === listName;
      const newSelectedList = selectedListWasDeleted ? newListNames[0] || '' : prevState.selectedList;
      if (selectedListWasDeleted) {
        onSelect(newSelectedList);
      }
      return { listNames: newListNames, selectedList: newSelectedList };
    });
  };

  const handleListClick = (listName: string) => {
    setState(prevState => ({ ...prevState, selectedList: listName }));
    onSelect(listName);
  };

  return (
    <div className="todo-list-selector">
      {state.listNames.length === 0 ? (
        <span>No TODO lists available</span>
      ) : (
        <ul>
          {state.listNames.map(listName => (
            <li
              key={listName}
              className={state.selectedList === listName ? 'selected' : ''}
              onClick={() => handleListClick(listName)}
            >
              {listName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
