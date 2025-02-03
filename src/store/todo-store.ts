import { Revision, StoredTodoItem, StoredTodoItemMetadata, TodoItemData, TodoItemId } from "../phaedra.types";

export type UpdateTodoSuccess = {
  result: 'updated',
  metadata: StoredTodoItemMetadata
};

export type ModificationConflict = {
  result: 'conflict',
  currentItem: StoredTodoItem
};

export type NotFound = {
  result: 'not-found'
  missing: 'list' | 'todo'
};

export type UpdateTodoResult = UpdateTodoSuccess | ModificationConflict | NotFound;

export type DeleteSuccess = {
  result: 'deleted'
};

export type DeleteResult = DeleteSuccess | ModificationConflict | NotFound;

export type CreateTodoSuccess = {
  result: 'created',
  metadata: StoredTodoItemMetadata
}

export type CreateTodoResult = CreateTodoSuccess | NotFound;

export interface ITodoStore {
  createList(listName: string): void;
  // TODO: deleteList()
  getLists(): string[];

  create(listName: string, todo: TodoItemData): CreateTodoResult;
  getById(listName: string, todoId: TodoItemId): StoredTodoItem | undefined; // TODO: Consider NotFound instead of undefined
  list(listName: string): StoredTodoItem[] | undefined; // TODO: Consider NotFound instead of undefined
  update(listName: string, todoId: TodoItemId, todo: TodoItemData, revision: Revision): UpdateTodoResult;
  delete(listName: string, todoId: TodoItemId, revision: Revision): DeleteResult;
}
