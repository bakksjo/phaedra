import { Revision, StoredTodoItem, StoredTodoItemMetadata, StoreEvent, TodoItemData, TodoItemId, TodoStoreExport } from '../phaedra.types';
import { IStoreImportExport } from './store-import-export';
import { CreateTodoResult, DeleteResult, ITodoStore, UpdateTodoResult, UpdateValidationFunction } from './store-crud';
import { v4 as uuidv4 } from 'uuid';
import { zTodoStoreExport } from '../phaedra-schemas';
import { IListenableTodoStore, IStoreListenerHandle, StoreListener } from './store-listen';

interface TodoList {
  [listName: string]: StoredTodoItem[];
}

export class EphemeralTodoStore implements ITodoStore, IStoreImportExport, IListenableTodoStore {
  private todoLists: TodoList = {};
  private listeners: Record<string, StoreListener[]> = {};

  updateListeners(listName: string, event: StoreEvent): void {
    const listeners = this.listeners[listName];
    if (!listeners) return;

    listeners.forEach(listener => listener(event));
  }

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

    this.updateListeners(listName, { type: 'update', todo: storedTodo });

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

  update<T>(listName: string, todoId: TodoItemId, revision: Revision, todo: TodoItemData, validation?: UpdateValidationFunction<T>): UpdateTodoResult<T> {
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

    this.updateListeners(listName, { type: 'update', todo: updatedItem });

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

    this.updateListeners(listName, { type: 'delete', id: todoId });

    return { result: 'deleted' };
  }

  importStore(data: TodoStoreExport): void {
    this.todoLists = data;
  }

  exportStore(): TodoStoreExport {
    return zTodoStoreExport.parse(this.todoLists);
  }

  addListener(listName: string, listener: StoreListener): IStoreListenerHandle {
    if (!this.todoLists[listName]) {
      throw new Error(`List ${listName} does not exist`);
    }

    if (!this.listeners[listName]) {
      this.listeners[listName] = [];
    }

    this.listeners[listName].push(listener);

    const removeListener = () => {
      this.listeners[listName] = this.listeners[listName].filter(l => l !== listener);
      if (this.listeners[listName].length === 0) {
        delete this.listeners[listName];
      }
    };

    return { remove: removeListener };
  }
}
