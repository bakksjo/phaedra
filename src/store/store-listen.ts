import { StoreListEvent, StoreTodoEvent } from "../phaedra.types";

export interface IStoreListenerHandle {
  remove(): void;
}

export type TodoListener = (event: StoreTodoEvent) => void;

export type ListListener = (event: StoreListEvent) => void;

export interface IListenableTodoStore {
  addListListener(listener: ListListener): IStoreListenerHandle;
  addTodoListener(listName: string, listener: TodoListener): IStoreListenerHandle;
}
