import { StoreEvent } from "../phaedra.types";

export interface IStoreListenerHandle {
  remove(): void;
}

export type StoreListener = (event: StoreEvent) => void;

export interface IListenableTodoStore {
  addListener(listName: string, listener: StoreListener): IStoreListenerHandle;
}
