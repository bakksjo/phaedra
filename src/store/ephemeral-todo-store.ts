import { Revision, StoredTodoItem, StoredTodoItemMetadata, TodoItemData, TodoItemId } from '../phaedra.types';
import { ILoadableStore } from './loadable-store';
import { CreateTodoResult, DeleteResult, ITodoStore, UpdateTodoResult, UpdateValidationFunction } from './todo-store';
import { v4 as uuidv4 } from 'uuid';

interface TodoList {
  [listName: string]: StoredTodoItem[];
}

export class EphemeralTodoStore implements ITodoStore, ILoadableStore {
  private todoLists: TodoList = {};

  createList(listName: string): void {
    this.todoLists[listName] = [];
  }

  getLists(): string[] {
    return Object.keys(this.todoLists);
  }

  create(listName: string, todo: TodoItemData): CreateTodoResult {
    if (!this.todoLists[listName]) return { result: 'not-found', missing: 'list' };

    const metadata: StoredTodoItemMetadata = {
      id: uuidv4(),
      revision: 1,
      lastModifiedTime: new Date().toISOString(),
    };
    const storedTodo: StoredTodoItem = {
      data: todo,
      meta: metadata,
    };
    this.todoLists[listName].push(storedTodo);

    return { result: 'created', todo: storedTodo };
  }

  getById(listName: string, todoId: TodoItemId): StoredTodoItem | undefined {
    const list = this.todoLists[listName];
    if (!list) return undefined;
    return list.find(todo => todo.meta.id === todoId);
  }

  list(listName: string): StoredTodoItem[] | undefined {
    return this.todoLists[listName];
  }

  update<T>(listName: string, todoId: TodoItemId, todo: TodoItemData, revision: Revision, validation?: UpdateValidationFunction<T>): UpdateTodoResult<T> {
    const list = this.todoLists[listName];
    if (!list) return { result: 'not-found', missing: 'list' };

    const index = list.findIndex(todo => todo.meta.id === todoId);
    if (index === -1) return { result: 'not-found', missing: 'todo' };

    const currentlyStoredItem = list[index];
    if (currentlyStoredItem.meta.revision !== revision) return { result: 'conflict', currentItem: currentlyStoredItem };

    if (validation) {
      const validationError = validation(currentlyStoredItem.data, todo);
      if (validationError) return { result: 'validation-failure', validationError };
    }

    const newMetadata = {
      id: currentlyStoredItem.meta.id,
      revision: currentlyStoredItem.meta.revision + 1,
      lastModifiedTime: new Date().toISOString(),
    };
    const updatedItem: StoredTodoItem = {
      data: todo,
      meta: newMetadata,
    };
    list[index] = updatedItem;

    return { result: 'updated', todo: updatedItem };
  }

  delete(listName: string, todoId: TodoItemId, revision: Revision): DeleteResult {
    const list = this.todoLists[listName];
    if (!list) return { result: 'not-found', missing: 'list' };

    const index = list.findIndex(todo => todo.meta.id === todoId);
    if (index === -1) return { result: 'not-found', missing: 'todo' };

    const currentlyStoredTodo = list[index];
    if (currentlyStoredTodo.meta.revision !== revision) return { result: 'conflict', currentItem: currentlyStoredTodo };

    list.splice(index, 1);

    return { result: 'deleted' };
  }

  load(listName: string, todo: StoredTodoItem[]): void {
    this.todoLists[listName] = todo;
  }
}
