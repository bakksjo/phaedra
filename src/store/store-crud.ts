import { Revision, StoredTodoItem, TodoItemData, TodoItemId } from "../phaedra.types";

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
  what: 'list' | 'todo'
};

export type UpdateTodoResult<T> = UpdateTodoSuccess | ModificationConflict | NotFound | UpdateTodoValidationFailure<T>;

export type DeleteSuccess = {
  result: 'deleted'
};

export type DeleteResult = DeleteSuccess | ModificationConflict | NotFound;

export type CreateTodoSuccess = {
  result: 'created',
  todo: StoredTodoItem
};

export type CreateTodoResult = CreateTodoSuccess | NotFound;

export type GetTodoSuccess = {
  result: 'exists',
  todo: StoredTodoItem
};

export type GetTodoResult = GetTodoSuccess | NotFound;

export type CreateListResult = 'created' | 'already-exists';

export type DeleteListResult = 'deleted' | 'not-found';

export type ListTodosResult = StoredTodoItem[] | 'list-not-found';

export interface ITodoStore {
  createList(listName: string): CreateListResult;
  deleteList(listName: string): DeleteListResult;
  getLists(): string[];

  create(listName: string, todo: TodoItemData): CreateTodoResult;
  getById(listName: string, todoId: TodoItemId): GetTodoResult;
  list(listName: string): ListTodosResult;
  update<T>(listName: string, todoId: TodoItemId, revision: Revision, todo: TodoItemData, validation?: UpdateValidationFunction<T>): UpdateTodoResult<T>;
  delete(listName: string, todoId: TodoItemId, revision: Revision): DeleteResult;
}
