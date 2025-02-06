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
  let sut: EphemeralTodoStore;

  const listName = 'testList';
  const todo: TodoItemData = {
    createdByUser: 'user1',
    state: 'TODO',
    title: 'Test TODO',
  };

  beforeEach(() => {
    sut = new EphemeralTodoStore();
    sut.createList(listName);
  });

  test('added TODO is stored', () => {
    const res = sut.create(listName, todo);
    expect(res.result).toEqual('created');
    if (res.result !== 'created') throw unreachableButRequiredForNarrowing();

    expect(res.todo.meta.id).toBeDefined();
    expect(res.todo.meta.revision).toBe(1);

    const getRes = sut.getById(listName, res.todo.meta.id);
    expect(getRes.result).not.toBe('not-found');
    if (getRes.result === 'not-found') throw unreachableButRequiredForNarrowing();

    expect(getRes.todo.data).toEqual(todo);

    const todos = sut.list(listName);
    expect(todos).toHaveLength(1);
    expect(todos).toContainEqual(getRes.todo);
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
    expect(todos).not.toBe('list-not-found');
    if (todos === 'list-not-found') throw unreachableButRequiredForNarrowing();

    expect(todos).toHaveLength(2);
    expectTodosToContain(todos, todo, secondTodo);
  });

  test('updates are reflected in the store', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const updatedTodo: TodoItemData = { ...todo, title: 'Updated TODO', state: 'DONE' };
    sut.update(listName, res1.todo.meta.id, res1.todo.meta.revision, updatedTodo);

    const getRes = sut.getById(listName, res1.todo.meta.id);
    expect(getRes.result).not.toBe('not-found');
    if (getRes.result === 'not-found') throw unreachableButRequiredForNarrowing();

    expect(getRes.todo.data).toEqual(updatedTodo);
    expect(getRes.todo.meta.revision).toBeGreaterThan(res1.todo.meta.revision);
    expect(new Date(getRes.todo.meta.lastModifiedTime).getTime())
      .toBeGreaterThanOrEqual(new Date(res1.todo.meta.lastModifiedTime).getTime());
    expect(getRes.todo.meta.id).toEqual(res1.todo.meta.id);

    const todos = sut.list(listName);
    expect(todos).not.toBe('list-not-found');
    if (todos === 'list-not-found') throw unreachableButRequiredForNarrowing();

    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, updatedTodo);
  });

  test('deleted items are removed from store', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') return;

    sut.delete(listName, res1.todo.meta.id, res1.todo.meta.revision);

    const getRes = sut.getById(listName, res1.todo.meta.id);
    expect(getRes.result).toBe('not-found');
    if (getRes.result !== 'not-found') throw unreachableButRequiredForNarrowing();

    expect(getRes.what).toBe('todo');

    const todos = sut.list(listName);
    expect(todos).not.toBe('list-not-found');
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
    if (firstList === 'list-not-found') throw unreachableButRequiredForNarrowing();

    expect(firstList).toHaveLength(1);
    expectTodosToContain(firstList, todo);

    const secondList = sut.list(anotherListName);
    if (secondList === 'list-not-found') throw unreachableButRequiredForNarrowing();

    expect(secondList).toHaveLength(1);
    expectTodosToContain(secondList, anotherTodo);
  });
  
  test('returns NotFound for non-existent TODO item', () => {
    const getRes = sut.getById(listName, 'non-existent-id');
    expect(getRes.result).toBe('not-found');
    if (getRes.result !== 'not-found') throw unreachableButRequiredForNarrowing();

    expect(getRes.what).toBe('todo');
  });

  test('returns NotFound for getById from non-existent list', () => {
    const getRes = sut.getById('non-existent-list', 'irrelevant-id');
    expect(getRes.result).toBe('not-found');
    if (getRes.result !== 'not-found') throw unreachableButRequiredForNarrowing();

    expect(getRes.what).toBe('list');
  });

  test('returns not found when listing non-existent list', () => {
    const todos = sut.list('non-existent-list');
    expect(todos).toBe('list-not-found');
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
    if (todos === 'list-not-found') throw unreachableButRequiredForNarrowing();

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
    if (todos === 'list-not-found') throw unreachableButRequiredForNarrowing();

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
    if (todos === 'list-not-found') throw unreachableButRequiredForNarrowing();

    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, todo);
  });

  test('fails to create TODO in non-existent list', () => {
    const result = sut.create('non-existent-list', todo);

    expect(result.result).toBe('not-found');
    if (result.result !== 'not-found') throw unreachableButRequiredForNarrowing();

    expect(result.what).toBe('list');
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
    if (todos === 'list-not-found') throw unreachableButRequiredForNarrowing();

    expect(todos).toHaveLength(1);
    expectTodosToContain(todos, todo);
  });

  test('fails to delete non-existent TODO item', () => {
    const deleteResult = sut.delete(listName, 'non-existent-id', 1);
    expect(deleteResult.result).toBe('not-found');
    if (deleteResult.result !== 'not-found') throw unreachableButRequiredForNarrowing();
    expect(deleteResult.what).toBe('todo');
  });

  test('fails to delete a TODO item from a non-existent list', () => {
    const deleteResult = sut.delete('non-existent-list', 'item-id-is-irrelevant', 1);
    expect(deleteResult.result).toBe('not-found');
    if (deleteResult.result !== 'not-found') throw unreachableButRequiredForNarrowing();
    expect(deleteResult.what).toBe('list');
  });

  test('fails to update a TODO item in a non-existent list', () => {
    const updateResult = sut.update('non-existent-list', 'item-id-is-irrelevant', 1, todo);

    expect(updateResult.result).toBe('not-found');
    if (updateResult.result !== 'not-found') throw unreachableButRequiredForNarrowing();

    expect(updateResult.what).toBe('list');
  });

  test('fails to update a non-existent TODO item', () => {
    const updateResult = sut.update(listName, 'non-existent-id', 1, todo);

    expect(updateResult.result).toBe('not-found');
    if (updateResult.result !== 'not-found') throw unreachableButRequiredForNarrowing();

    expect(updateResult.what).toBe('todo');
  });

  test('fails to update a TODO item with a non-matching revision', () => {
    const res1 = sut.create(listName, todo);
    if (res1.result !== 'created') throw unreachableButRequiredForNarrowing();

    const updateResult = sut.update(listName, res1.todo.meta.id, res1.todo.meta.revision - 1, todo);

    expect(updateResult.result).toBe('conflict');
    if (updateResult.result !== 'conflict') throw unreachableButRequiredForNarrowing();

    expect(updateResult.currentItem).toEqual(res1.todo);
  });

  test('fails to create a list that already exists', () => {
    const result = sut.createList(listName);
    expect(result).toBe('already-exists');
  });

  test('can delete a list', () => {
    const result = sut.deleteList(listName);
    expect(result).toBe('deleted');

    const lists = sut.getLists();
    expect(lists).toHaveLength(0);
  });

  test('can delete a list even if it has TODO items in it', () => {
    sut.create(listName, todo);

    const result = sut.deleteList(listName);
    expect(result).toBe('deleted');

    const lists = sut.getLists();
    expect(lists).toHaveLength(0);
  });
});

describe('EphemeralTodoStore without any lists', () => {
  test('getLists() returns empty array when no lists exist', () => {
    const sut = new EphemeralTodoStore();
    const lists = sut.getLists();
    expect(lists).toHaveLength(0);
  });
});

describe('EphemeralTodoStore exportStore()', () => {
  let sut: EphemeralTodoStore;
  const todo1: TodoItemData = { title: 'Task 1', createdByUser: 'user1', state: 'TODO' };
  const todo2: TodoItemData = { title: 'Task 2', createdByUser: 'user2', state: 'TODO' };

  beforeEach(() => {
    sut = new EphemeralTodoStore();
    const list1Name = 'list1';
    const list2Name = 'list2';

    sut.createList(list1Name);
    sut.createList(list2Name);
  
    sut.create(list1Name, todo1);
    sut.create(list2Name, todo2);
  });

  test('exportStore() output is complete and with correct format', () => {
    const exportedStore = sut.exportStore();
  
    expect(exportedStore).toEqual({
      list1: [
        {
          data: todo1,
          meta: expect.objectContaining({
            id: expect.any(String),
            revision: 1,
            lastModifiedTime: expect.any(String),
          }),
        },
      ],
      list2: [
        {
          data: todo2,
          meta: expect.objectContaining({
            id: expect.any(String),
            revision: 1,
            lastModifiedTime: expect.any(String),
          }),
        },
      ],
    });
  });

  test('exportStore() returns a defensive deep copy', () => {
    const exportedStoreDataBefore = sut.exportStore();
  
    // Mutate the exported object
    exportedStoreDataBefore.list3 = [{ data: { title: 'Task 3', createdByUser: 'user3', state: 'TODO' }, meta: { id: 'id3', revision: 1, lastModifiedTime: new Date().toISOString() } }];
    exportedStoreDataBefore.list1[0].data.title = 'Modified Task 1';
  
    // Validate that the changes didn't affect the original store.
    const exportedStoreDataAfter = sut.exportStore();
    expect(exportedStoreDataAfter).toEqual({
      list1: [
        {
          data: todo1,
          meta: expect.objectContaining({
            id: expect.any(String),
            revision: 1,
            lastModifiedTime: expect.any(String),
          }),
        },
      ],
      list2: [
        {
          data: todo2,
          meta: expect.objectContaining({
            id: expect.any(String),
            revision: 1,
            lastModifiedTime: expect.any(String),
          }),
        },
      ],
    });
  
    // Validate that the mutations did not affect the original store
    expect(exportedStoreDataAfter).not.toHaveProperty('list3');
    expect(exportedStoreDataAfter.list1[0].data.title).toBe('Task 1');
  });
});

describe('EphemeralTodoStore listening to store updates', () => {
  let sut: EphemeralTodoStore;
  const listName = 'testList';
  const todo1: TodoItemData = { title: 'Task 1', createdByUser: 'user1', state: 'TODO' };

  beforeEach(() => {
    sut = new EphemeralTodoStore();
    sut.createList(listName);
  });

  test('listener receives TODO updates', () => {
    const listener = jest.fn();
    sut.addTodoListener(listName, listener);

    const res = sut.create(listName, todo1);
    if (res.result !== 'created') throw unreachableButRequiredForNarrowing();

    expect(listener).toHaveBeenCalledWith({ type: 'update', todo: res.todo });
  });

  test('listener receives TODO deletes', () => {
    const listener = jest.fn();
    const createRes = sut.create(listName, todo1);
    if (createRes.result !== 'created') throw unreachableButRequiredForNarrowing();

    sut.addTodoListener(listName, listener);

    sut.delete(listName, createRes.todo.meta.id, createRes.todo.meta.revision);

    expect(listener).toHaveBeenCalledWith({ type: 'delete', id: createRes.todo.meta.id });
  });

  test('list listener receives list creation', () => {
    const listener = jest.fn();
    sut.addListListener(listener);

    const secondListName = 'list2';
    sut.createList(secondListName);

    expect(listener).toHaveBeenCalledWith({ type: 'created', list: secondListName });
  });

  test('list listener receives list deletion', () => {
    const listener = jest.fn();
    sut.addListListener(listener);

    sut.deleteList(listName);

    expect(listener).toHaveBeenCalledWith({ type: 'deleted', list: listName });
  });
});
