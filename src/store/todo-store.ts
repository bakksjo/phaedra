import { TodoItem } from "../phaedra.types";

export interface ITodoStore {
  add(listName: string, todo: TodoItem): void;
  getById(listName: string, todoId: string): TodoItem | undefined;
  list(listName: string): TodoItem[] | undefined;
  update(listName: string, todo: TodoItem): void;
  delete(listName: string, todoId: string): void;
}
