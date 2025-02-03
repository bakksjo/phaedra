import express, { Request, Response } from 'express';
import { zCreateTodoRequest, zStoredTodoItem, zTodoArray } from '../phaedra-schemas';
import { HttpErrorBody, StoredTodoItem, StoredTodoItemMetadata, TodoItemData } from '../phaedra.types';
import { zodErrorHandler } from './middleware/zodErrorHandler';
import { ITodoStore } from '../store/todo-store';
import { EphemeralTodoStore } from '../store/ephemeral-todo-store';
import jsonTodos from './todos.json';

const LIST_NAME = 'default'; // Hardcoded for now (TODO).

const createAndInitializeStore = (): ITodoStore => {
  const store = new EphemeralTodoStore();
  try {
    const preExistingTodos = zTodoArray.parse(jsonTodos);
    store.load(LIST_NAME, preExistingTodos);
  } catch (err) {
    console.error('Error parsing pre-existing todos:', err);
  }
  return store;
}

function configureServiceEndpoints(apiServer: express.Application, todoStore: ITodoStore) {
  apiServer.use(express.json());
  apiServer.use(zodErrorHandler);

  apiServer.get('/todo-lists', (req: Request, res: Response) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
    const lists = todoStore.getLists();
    res.send(lists);
  });

  apiServer.get('/todo-lists/:listName/todos', (req: Request, res: Response<StoredTodoItem[] | HttpErrorBody>) => {
    const listName = req.params.listName;
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
    const todos = todoStore.list(listName);
    if (!todos) {
      res.status(404).send({ message: `List "${listName}" not found` });
      return
    }

    res.send(todos);
  });

  apiServer.post('/todo-lists/:listName/todos', (request: Request, response: Response<StoredTodoItemMetadata | HttpErrorBody>) => {
    const listName = request.params.listName;
    const createTodoRequest = zCreateTodoRequest.parse(request.body);

    response.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });

    const newTodo: TodoItemData = {
      title: createTodoRequest.title,
      createdByUser: createTodoRequest.creator,
      state: 'TODO',
    };
    const creation = todoStore.create(listName, newTodo);
    switch (creation.result) {
      case 'created':
        response.status(201).send(creation.metadata);
        return;

      case 'not-found':
        response.status(404).send({ message: `List ${listName} not found` });
        return;
    }
  });
}

export function startTodoService(port: number) {
  const app = express();
  const todoStore = createAndInitializeStore();
  configureServiceEndpoints(app, todoStore);
  const server = app.listen(port, () => {
    console.log(`Todo service running on port ${port}`);
  });
  return server;
}
