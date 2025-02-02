import { TodoItem } from '../phaedra.types';
import { ITodoStore } from './todo-store';

interface TodoList {
  [listName: string]: TodoItem[];
}

export class EphemeralTodoStore implements ITodoStore {
  private todoLists: TodoList = {};

  getLists(): string[] {
    return Object.keys(this.todoLists);
  }

  add(listName: string, todo: TodoItem): void {
    if (!this.todoLists[listName]) {
      this.todoLists[listName] = [];
    }
    this.todoLists[listName].push(todo);
  }

  getById(listName: string, todoId: string): TodoItem | undefined {
    const list = this.todoLists[listName];
    if (!list) return undefined;
    return list.find(todo => todo.id === todoId);
  }

  list(listName: string): TodoItem[] | undefined {
    return this.todoLists[listName];
  }

  update(listName: string, updatedTodo: TodoItem): void {
    const list = this.todoLists[listName];
    if (!list) return;
    const index = list.findIndex(todo => todo.id === updatedTodo.id);
    if (index !== -1) {
      list[index] = updatedTodo;
    }
  }

  delete(listName: string, todoId: string): void {
    const list = this.todoLists[listName];
    if (!list) return;
    const index = list.findIndex(todo => todo.id === todoId);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }
}