import React from 'react';
import { TodoState } from '../../phaedra.types';
import './StateFilterSelector.css';

interface StateFilterSelectorProps {
  selected: TodoState[];
  onChange: (selectedStates: TodoState[]) => void;
}

const availableStates: TodoState[] = ['TODO', 'ONGOING', 'DONE'];

export const StateFilterSelector: React.FC<StateFilterSelectorProps> = ({ selected, onChange }) => {
  const handleCheckboxChange = (state: TodoState) => {
    const newSelected = selected.includes(state)
      ? selected.filter(s => s !== state) // Remove
      : [...selected, state]; // Add
    onChange(newSelected);
  };

  return (
    <div className="state-filter-selector">
      {availableStates.map(state => (
        <label key={state} className="state-filter-label">
          <input
            type="checkbox"
            checked={selected.includes(state)}
            onChange={() => handleCheckboxChange(state)}
          />
          {state}
        </label>
      ))}
    </div>
  );
};