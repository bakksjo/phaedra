import { TodoItem } from '../phaedra.types';
import { ITodoStore } from './todo-store';
import { EphemeralTodoStore } from './ephemeral-todo-store';

describe('TodoStore', () => {
  let store: ITodoStore;
  const listName = 'testList';
  const todo: TodoItem = {
    createdByUser: 'user1',
    id: '1',
    lastModifiedTime: new Date().toISOString(),
    state: 'TODO',
    title: 'Test TODO',
  };

  beforeEach(() => {
    // TODO: Make this test a implementation-agnostic "template" that can be run against multiple implementations.
    store = new EphemeralTodoStore();
  });

  test('added TODO is stored', () => {
    store.add(listName, todo);

    const storedTodo = store.getById(listName, todo.id);
    expect(storedTodo).toEqual(todo);

    const todos = store.list(listName);
    expect(todos).toHaveLength(1);
    expect(todos).toContainEqual(todo);
  });

  test('all TODO items in a list can be listed', () => {
    store.add(listName, todo);
    const secondTodo: TodoItem = {
      id: '2',
      title: 'Another Test TODO',
      createdByUser: 'user2',
      lastModifiedTime: new Date().toISOString(),
      state: 'ONGOING'
    }
    store.add(listName, secondTodo);
    const todos = store.list(listName);
    expect(todos).toHaveLength(2);
    expect(todos).toContainEqual(todo);
    expect(todos).toContainEqual(secondTodo);
  });

  test('updates are reflected in the store', () => {
    store.add(listName, todo);
    const updatedTodo: TodoItem = { ...todo, title: 'Updated TODO', state: 'DONE' };
    store.update(listName, updatedTodo);

    const storedTodo = store.getById(listName, todo.id);
    expect(storedTodo).toEqual(updatedTodo);

    const todos = store.list(listName);
    expect(todos).toHaveLength(1);
    expect(todos).toContainEqual(updatedTodo);
  });

  test('deleted items are removed from store', () => {
    store.add(listName, todo);
    store.delete(listName, todo.id);

    const storedTodo = store.getById(listName, todo.id);
    expect(storedTodo).toBeUndefined();

    const todos = store.list(listName);
    expect(todos).toHaveLength(0);
  });
  
  test('TODO items in multiple lists are kept separate', () => {
    store.add(listName, todo);

    const anotherListName = 'anotherTestList';
    const anotherTodo: TodoItem = {
      id: '2',
      title: 'Another Test TODO',
      createdByUser: 'user2',
      lastModifiedTime: new Date().toISOString(),
      state: 'ONGOING'
    };
    store.add(anotherListName, anotherTodo);

    const todosInFirstList = store.list(listName);
    expect(todosInFirstList).toHaveLength(1);
    expect(todosInFirstList).toContainEqual(todo);
    expect(todosInFirstList).not.toContainEqual(anotherTodo);

    const todosInSecondList = store.list(anotherListName);
    expect(todosInSecondList).toHaveLength(1);
    expect(todosInSecondList).toContainEqual(anotherTodo);
    expect(todosInSecondList).not.toContainEqual(todo);
  });
  
  test('returns undefined for non-existent TODO item', () => {
    const fetchedTodo = store.getById(listName, 'non-existent-id');
    expect(fetchedTodo).toBeUndefined();
  });

  test('returns empty array for non-existent list', () => {
    const todos = store.list('non-existent-list');
    expect(todos).toBeUndefined();
  });

  test('can list all existing TODO lists', () => {
    store.add(listName, todo);
    const anotherListName = 'anotherTestList';
    store.add(anotherListName, { ...todo, id: '2' });

    const lists = store.getLists();
    expect(lists).toHaveLength(2);
    expect(lists).toContain(listName);
    expect(lists).toContain(anotherListName);
  });

  test('returns empty array when no lists exist', () => {
    const lists = store.getLists();
    expect(lists).toHaveLength(0);
  });
});