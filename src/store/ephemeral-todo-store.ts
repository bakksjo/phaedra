import { Revision, StoredTodoItem, StoredTodoItemMetadata, StoreListEvent, StoreTodoEvent, TodoItemData, TodoItemId, TodoStoreExport } from '../phaedra.types';
import { IStoreImportExport } from './store-import-export';
import { CreateListResult, CreateTodoResult, DeleteListResult, DeleteResult, GetTodoResult, ITodoStore, UpdateTodoResult, UpdateValidationFunction } from './store-crud';
import { v4 as uuidv4 } from 'uuid';
import { zTodoStoreExport } from '../phaedra-schemas';
import { IListenableTodoStore, IStoreListenerHandle, ListListener, TodoListener } from './store-listen';

interface TodoList {
  [listName: string]: StoredTodoItem[];
}

export class EphemeralTodoStore implements ITodoStore, IStoreImportExport, IListenableTodoStore {
  private todoLists: TodoList = {};
  private todoListeners: Record<string, TodoListener[]> = {};
  private listListeners: ListListener[] = [];

  updateTodoListeners(listName: string, event: StoreTodoEvent): void {
    const listeners = this.todoListeners[listName];
    if (!listeners) return;

    listeners.forEach(listener => listener(event));
  }

  updateListListeners(event: StoreListEvent): void {
    this.listListeners.forEach(listener => listener(event));
  }

  createList(listName: string): CreateListResult {
    if (this.todoLists[listName]) return 'already-exists';

    this.todoLists[listName] = [];

    this.updateListListeners({ type: 'created', list: listName });

    return 'created';
  }

  deleteList(listName: string): DeleteListResult {
    if (!this.todoLists[listName]) return 'not-found';

    delete this.todoLists[listName];

    this.updateListListeners({ type: 'deleted', list: listName });

    return 'deleted';
  }

  getLists(): string[] {
    return Object.keys(this.todoLists);
  }

  create(listName: string, todo: TodoItemData): CreateTodoResult {
    if (!this.todoLists[listName]) return { result: 'not-found', what: 'list' };

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

    this.updateTodoListeners(listName, { type: 'update', todo: storedTodo });

    return { result: 'created', todo: storedTodo };
  }

  getById(listName: string, todoId: TodoItemId): GetTodoResult {
    const list = this.todoLists[listName];
    if (!list) return { result: 'not-found', what: 'list' };

    const item = list.find(todo => todo.meta.id === todoId);
    if (!item) return { result: 'not-found', what: 'todo' };

    return { result: 'exists', todo: item };
  }

  list(listName: string): StoredTodoItem[] | 'list-not-found' {
    if (!this.todoLists[listName]) return 'list-not-found';

    return this.todoLists[listName];
  }

  update<T>(listName: string, todoId: TodoItemId, revision: Revision, todo: TodoItemData, validation?: UpdateValidationFunction<T>): UpdateTodoResult<T> {
    const list = this.todoLists[listName];
    if (!list) return { result: 'not-found', what: 'list' };

    const index = list.findIndex(todo => todo.meta.id === todoId);
    if (index === -1) return { result: 'not-found', what: 'todo' };

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

    this.updateTodoListeners(listName, { type: 'update', todo: updatedItem });

    return { result: 'updated', todo: updatedItem };
  }

  delete(listName: string, todoId: TodoItemId, revision: Revision): DeleteResult {
    const list = this.todoLists[listName];
    if (!list) return { result: 'not-found', what: 'list' };

    const index = list.findIndex(todo => todo.meta.id === todoId);
    if (index === -1) return { result: 'not-found', what: 'todo' };

    const currentlyStoredTodo = list[index];
    if (currentlyStoredTodo.meta.revision !== revision) return { result: 'conflict', currentItem: currentlyStoredTodo };

    list.splice(index, 1);

    this.updateTodoListeners(listName, { type: 'delete', id: todoId });

    return { result: 'deleted' };
  }

  importStore(data: TodoStoreExport): void {
    this.todoLists = data;
  }

  exportStore(): TodoStoreExport {
    return zTodoStoreExport.parse(this.todoLists);
  }

  addTodoListener(listName: string, listener: TodoListener): IStoreListenerHandle {
    if (!this.todoLists[listName]) {
      throw new Error(`List ${listName} does not exist`);
    }

    if (!this.todoListeners[listName]) {
      this.todoListeners[listName] = [];
    }

    this.todoListeners[listName].push(listener);

    const removeListener = () => {
      this.todoListeners[listName] = this.todoListeners[listName].filter(l => l !== listener);
      if (this.todoListeners[listName].length === 0) {
        delete this.todoListeners[listName];
      }
    };

    return { remove: removeListener };
  }

  addListListener(listener: ListListener): IStoreListenerHandle {
    this.listListeners.push(listener);

    const removeListener = () => {
      this.listListeners = this.listListeners.filter(l => l !== listener);
    };

    return { remove: removeListener };
  }
}
