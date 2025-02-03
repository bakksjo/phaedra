import { Revision, StoredTodoItem, StoredTodoItemMetadata, TodoItemData, TodoItemId } from "../phaedra.types";

export type UpdateTodoSuccess = {
  result: 'updated',
  todo: StoredTodoItem
};

export type UpdateValidationFunction<T> = (currentItem: TodoItemData, proposedItem: TodoItemData) => T | undefined;

export type UpdateTodoValidationFailure<T> = {
  result: 'validation-failure',
  validationError: T
};

export type ModificationConflict = {
  result: 'conflict',
  currentItem: StoredTodoItem
};

export type NotFound = {
  result: 'not-found'
  missing: 'list' | 'todo'
};

export type UpdateTodoResult<T> = UpdateTodoSuccess | ModificationConflict | NotFound | UpdateTodoValidationFailure<T>;

export type DeleteSuccess = {
  result: 'deleted'
};

export type DeleteResult = DeleteSuccess | ModificationConflict | NotFound;

export type CreateTodoSuccess = {
  result: 'created',
  todo: StoredTodoItem
}

export type CreateTodoResult = CreateTodoSuccess | NotFound;

export interface ITodoStore {
  createList(listName: string): void;
  // TODO: deleteList()
  getLists(): string[];

  create(listName: string, todo: TodoItemData): CreateTodoResult;
  getById(listName: string, todoId: TodoItemId): StoredTodoItem | undefined; // TODO: Consider NotFound instead of undefined
  list(listName: string): StoredTodoItem[] | undefined; // TODO: Consider NotFound instead of undefined
  update<T>(listName: string, todoId: TodoItemId, revision: Revision, todo: TodoItemData, validation?: UpdateValidationFunction<T>): UpdateTodoResult<T>; // TODO: Swap todo and revision parameters.
  delete(listName: string, todoId: TodoItemId, revision: Revision): DeleteResult;
}
