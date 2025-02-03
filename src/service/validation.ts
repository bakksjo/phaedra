import { TodoItemData } from "../phaedra.types";

export const validateUpdate = (
  currentItem: TodoItemData,
  proposedItem: TodoItemData
): string | undefined => {
  // Changing the creator is not allowed.
  if (currentItem.createdByUser !== proposedItem.createdByUser) {
    return `Illegal attempt to change property 'createdByUser' from '${currentItem.createdByUser}' to '${proposedItem.createdByUser}'`;
  }

  // Only certain state transitions are allowed.
  if (
    (currentItem.state === "TODO" && proposedItem.state === "DONE") ||
    (currentItem.state === "DONE" && proposedItem.state === "TODO")
  ) {
    return `Illegal attempt to change state from '${currentItem.state}' to '${proposedItem.state}'`;
  }
};
