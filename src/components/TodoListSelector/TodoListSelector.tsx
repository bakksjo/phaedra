import React, { useEffect, useState } from 'react';
import { CreateListRequest, StoreListEvent } from '../../phaedra.types';
import { zStoreListEvent } from '../../phaedra-schemas';
import { TextInput } from '../TextInput/TextInput';
import { BaseUrlContext } from '../BaseUrlContext';
import './TodoListSelector.css';

interface TodoListSelectorProps {
  onSelect: (listName: string) => void;
}

interface ListState {
  listNames: string[];
  selectedList: string;
}

export const TodoListSelector = ({ onSelect }: TodoListSelectorProps) => {
  const serviceBaseUrl = React.useContext(BaseUrlContext);
  const [state, setState] = useState<ListState>({ listNames: [], selectedList: '' });
  const [isAddingNewList, setIsAddingNewList] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(`${serviceBaseUrl}/todo-lists/events`);

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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenList = event.target.value;
    setState(prevState => ({ ...prevState, selectedList: chosenList }));
    onSelect(chosenList);
  };

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

  const handleAddNewListClick = () => {
    setIsAddingNewList(true);
  };

  const handleNewListSubmit = async (listName: string) => {
    const requestBody: CreateListRequest = { listName: listName };

    try {
      const response = await fetch(`${serviceBaseUrl}/todo-lists`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new list');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAddingNewList(false);
    }
  };

  const handleNewListCancel = () => {
    setIsAddingNewList(false);
  };

  return (
    <div className="todo-list-selector" data-testid="todo-list-selector">
      {state.listNames.length > 0 && (
        <>
          <label htmlFor="todo-list-selector" className="selector-label">
            List:
          </label>
          <select
            id="todo-list-selector"
            value={state.selectedList}
            onChange={handleChange}
            className="selector-dropdown"
          >
            {state.listNames.map((listName) => (
              <option key={listName} value={listName}>
                {listName}
              </option>
            ))}
          </select>
        </>
      )}
      {!isAddingNewList && <button onClick={handleAddNewListClick}>+ New list</button>}
      {isAddingNewList && (
        <TextInput
          placeholder="Enter list name"
          onSubmit={handleNewListSubmit}
          onCancel={handleNewListCancel}
        />
      )}
    </div>
  );
};
