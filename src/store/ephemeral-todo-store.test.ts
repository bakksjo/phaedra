import { StoredTodoItem, TodoItemData } from '../phaedra.types';
import { EphemeralTodoStore } from './ephemeral-todo-store';

  // TODO: Make this test a implementation-agnostic "template" that can be run against multiple implementations.

  // Unfortunately, Jest matchers don't play well with discriminated unions so we need this :-(
const unreachableButRequiredForNarrowing = () => { throw new Error("Should never happen - present for type narrowing only"); };

const expectTodosToContain = (storedTodos: StoredTodoItem[] | undefined, ...expectedTodos: TodoItemData[]) => {
  expect(storedTodos).toBeDefined();
  if (!storedTodos) throw unreachableButRequiredForNarrowing();

  const todosDataOnly = storedTodos.map(todo => todo.data);
  expectedTodos.forEach(todo => expect(todosDataOnly).toContainEqual(todo));
}

const VALIDATION_ERROR = "Can only append to the title";
const titleAppendOnlyValidator = (currentItem: TodoItemData, proposedItem: TodoItemData): string | undefined => {
  if (!proposedItem.title.startsWith(currentItem.title)) {
    return VALIDATION_ERROR;
  }
};

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

    expect(res.todo.meta.id).toBeDefined();

    const storedTodo = sut.getById(listName, res.todo.meta.id);
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
    expectTodosToContain(todos, todo, secondTodo);
  });

  test('updates are reflected in the store', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const updatedTodo: TodoItemData = { ...todo, title: 'Updated TODO', state: 'DONE' };
    sut.update(listName, res1.todo.meta.id, res1.todo.meta.revision, updatedTodo);

    const storedTodo = sut.getById(listName, res1.todo.meta.id);
    expect(storedTodo).toBeDefined();
    if (!storedTodo) throw unreachableButRequiredForNarrowing();

    expect(storedTodo.data).toEqual(updatedTodo);
    expect(storedTodo.meta.revision).toBeGreaterThan(res1.todo.meta.revision);
    expect(new Date(storedTodo.meta.lastModifiedTime).getTime())
      .toBeGreaterThanOrEqual(new Date(res1.todo.meta.lastModifiedTime).getTime());
    expect(storedTodo.meta.id).toEqual(res1.todo.meta.id);

    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, updatedTodo);
  });

  test('deleted items are removed from store', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') return;

    sut.delete(listName, res1.todo.meta.id, res1.todo.meta.revision);

    const storedTodo = sut.getById(listName, res1.todo.meta.id);
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
    expectTodosToContain(firstList, todo);

    const secondList = sut.list(anotherListName);
    expect(secondList).toHaveLength(1);
    expectTodosToContain(secondList, anotherTodo);
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

  test('returns conflict result on version conflict during update', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const updatedTodo: TodoItemData = { ...todo, title: 'Updated TODO' };
    const wrongRevision = res1.todo.meta.revision - 1;

    const res2 = sut.update(listName, res1.todo.meta.id, wrongRevision, updatedTodo);
    expect(res2.result).toBe('conflict');
    if (res2.result !== 'conflict') throw unreachableButRequiredForNarrowing();
    expect(res2.currentItem).toEqual(res1.todo);

    // Update attempt should not have changed any item in store.
    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, todo);
  });

  test('update with validator success is applied', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const validUpdate: TodoItemData = { ...todo, title: todo.title + ' suffix' };

    const res2 = sut.update(listName, res1.todo.meta.id, res1.todo.meta.revision, validUpdate, titleAppendOnlyValidator);
    expect(res2.result).toBe('updated');
    if (res2.result !== 'updated') throw unreachableButRequiredForNarrowing();
    
    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, validUpdate);
  });

  test('update with validator failure is not applied', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const invalidUpdate: TodoItemData = { ...todo, title: 'An entirely different title' };

    const res2 = sut.update(listName, res1.todo.meta.id, res1.todo.meta.revision, invalidUpdate, titleAppendOnlyValidator);
    expect(res2.result).toBe('validation-failure');
    if (res2.result !== 'validation-failure') throw unreachableButRequiredForNarrowing();
    expect(res2.validationError).toEqual(VALIDATION_ERROR);

    // Update attempt should not have changed any item in store.
    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, todo);
  });

  test('fails to create TODO in non-existent list', () => {
    const result = sut.create('non-existent-list', todo);
    expect(result.result).toBe('not-found');
  });

  test('can delete a TODO item', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const deleteResult = sut.delete(listName, res1.todo.meta.id, res1.todo.meta.revision);
    expect(deleteResult.result).toBe('deleted');

    const todos = sut.list(listName);
    expect(todos).toHaveLength(0);
  });

  test('returns conflict on delete with wrong version', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const wrongVersion = res1.todo.meta.revision - 1;
    const deleteResult = sut.delete(listName, res1.todo.meta.id, wrongVersion);
    expect(deleteResult.result).toBe('conflict');
    if (deleteResult.result !== 'conflict') throw unreachableButRequiredForNarrowing();
    expect(deleteResult.currentItem).toEqual(res1.todo);

    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, todo);
  });

  test('fails to delete non-existent TODO item', () => {
    const deleteResult = sut.delete(listName, 'non-existent-id', 1);
    expect(deleteResult.result).toBe('not-found');
    if (deleteResult.result !== 'not-found') throw unreachableButRequiredForNarrowing();
    expect(deleteResult.missing).toBe('todo');
  });

  test('fails to delete a TODO item from a non-existent list', () => {
    const deleteResult = sut.delete('non-existent-list', 'item-id-is-irrelevant', 1);
    expect(deleteResult.result).toBe('not-found');
    if (deleteResult.result !== 'not-found') throw unreachableButRequiredForNarrowing();
    expect(deleteResult.missing).toBe('list');
  });
});

describe('EphemeralTodoStore without any lists', () => {
  test('returns empty array when no lists exist', () => {
    const sut = new EphemeralTodoStore();
    const lists = sut.getLists();
    expect(lists).toHaveLength(0);
  });
});