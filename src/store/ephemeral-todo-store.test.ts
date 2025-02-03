import { StoredTodoItem, TodoItemData } from '../phaedra.types';
import { EphemeralTodoStore } from './ephemeral-todo-store';

  // TODO: Make this test a implementation-agnostic "template" that can be run against multiple implementations.

  // Unfortunately, Jest matchers don't play well with discriminated unions so we need this :-(
const unreachableButRequiredForNarrowing = () => { throw new Error("Should never happen - present for type narrowing only"); };

const expectTodosContain = (storedTodos: StoredTodoItem[] | undefined, ...expectedTodos: TodoItemData[]) => {
  expect(storedTodos).toBeDefined();
  if (!storedTodos) throw unreachableButRequiredForNarrowing();

  const todosDataOnly = storedTodos.map(todo => todo.data);
  expectedTodos.forEach(todo => expect(todosDataOnly).toContainEqual(todo));
}

describe('EphemeralTodoStore', () => {
  const sut = new EphemeralTodoStore();

  const listName = 'testList';
  const todo: TodoItemData = {
    createdByUser: 'user1',
    state: 'TODO',
    title: 'Test TODO',
  };

  beforeEach(() => {
    sut.createList(listName);
  });

  test('added TODO is stored', () => {
    const res = sut.create(listName, todo);
    expect(res.result).toEqual('created');
    if (res.result !== 'created') throw unreachableButRequiredForNarrowing();

    expect(res.metadata.id).toBeDefined();

    const storedTodo = sut.getById(listName, res.metadata.id);
    expect(storedTodo).toBeDefined();
    if (!storedTodo) throw unreachableButRequiredForNarrowing();

    expect(storedTodo.data).toEqual(todo);

    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expect(todos).toContainEqual(storedTodo);
  });

  test('all TODO items in a list can be listed', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const secondTodo: TodoItemData = {
      createdByUser: 'user2',
      state: 'ONGOING',
      title: 'Another Test TODO',
    };
    const res2 = sut.create(listName, secondTodo);
    if (res2.result !== 'created') throw unreachableButRequiredForNarrowing();

    const todos = sut.list(listName);

    expect(todos).toHaveLength(2);
    expectTodosContain(todos, todo, secondTodo);
  });

  test('updates are reflected in the store', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const updatedTodo: TodoItemData = { ...todo, title: 'Updated TODO', state: 'DONE' };
    sut.update(listName, res1.metadata.id, updatedTodo, res1.metadata.revision);

    const storedTodo = sut.getById(listName, res1.metadata.id);
    expect(storedTodo).toBeDefined();
    if (!storedTodo) throw unreachableButRequiredForNarrowing();

    expect(storedTodo.data).toEqual(updatedTodo);
    expect(storedTodo.meta.revision).toBeGreaterThan(res1.metadata.revision);
    expect(new Date(storedTodo.meta.lastModifiedTime).getTime())
      .toBeGreaterThanOrEqual(new Date(res1.metadata.lastModifiedTime).getTime());
    expect(storedTodo.meta.id).toEqual(res1.metadata.id);

    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expectTodosContain(todos, updatedTodo);
  });

  test('deleted items are removed from store', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') return;

    sut.delete(listName, res1.metadata.id, res1.metadata.revision);

    const storedTodo = sut.getById(listName, res1.metadata.id);
    expect(storedTodo).toBeUndefined();

    const todos = sut.list(listName);
    expect(todos).toHaveLength(0);
  });
  
  test('TODO items in multiple lists are kept separate', () => {
    sut.create(listName, todo);

    const anotherListName = 'anotherTestList';
    sut.createList(anotherListName);
    const anotherTodo: TodoItemData = {
      createdByUser: 'user2',
      state: 'ONGOING',
      title: 'Another Test TODO',
    };
    sut.create(anotherListName, anotherTodo);

    const firstList = sut.list(listName);
    expect(firstList).toHaveLength(1);
    expectTodosContain(firstList, todo);

    const secondList = sut.list(anotherListName);
    expect(secondList).toHaveLength(1);
    expectTodosContain(secondList, anotherTodo);
  });
  
  test('returns undefined for non-existent TODO item', () => {
    const fetchedTodo = sut.getById(listName, 'non-existent-id');
    expect(fetchedTodo).toBeUndefined();
  });

  test('returns empty array for non-existent list', () => {
    const todos = sut.list('non-existent-list');
    expect(todos).toBeUndefined();
  });

  test('can list all existing TODO lists', () => {
    const anotherListName = 'anotherTestList';
    sut.createList(anotherListName);

    const lists = sut.getLists();
    expect(lists).toHaveLength(2);
    expect(lists).toContain(listName);
    expect(lists).toContain(anotherListName);
  });

  // TODO: Need a lot of new tests (revisions, conflicts, etc.)
});

describe('EphemeralTodoStore without any lists', () => {
  test('returns empty array when no lists exist', () => {
    const sut = new EphemeralTodoStore();
    const lists = sut.getLists();
    expect(lists).toHaveLength(0);
  });
});