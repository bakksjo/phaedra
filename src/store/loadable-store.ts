import { StoredTodoItem } from "../phaedra.types";

export interface ILoadableStore {
  load(listName: string, todo: StoredTodoItem[]): void;
}
