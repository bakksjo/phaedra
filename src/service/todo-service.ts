import express, { Request, Response } from 'express';
import { todoSchema, listOfTodosSchema } from '../phaedra-schemas';
import { TodoItem } from '../phaedra.types';
import { zodErrorHandler } from './middleware/zodErrorHandler';
import { ITodoStore } from '../store/todo-store';
import { EphemeralTodoStore } from '../store/ephemeral-todo-store';
import jsonTodos from './todos.json';

const LIST_NAME = 'default'; // Hardcoded for now (TODO).

const createAndInitializeStore = (): ITodoStore => {
  const store: ITodoStore = new EphemeralTodoStore();
  try {
    const preExistingTodos = listOfTodosSchema.parse(jsonTodos);
    preExistingTodos.forEach(todo => store.add(LIST_NAME, todo));
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

  apiServer.get('/todo-lists/:listName/todos', (req: Request, res: Response) => {
    const listName = req.params.listName;
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
    const todos = todoStore.list(listName);
    res.send(todos);
  });

  apiServer.post('/todo-lists/:listName/todos', (req: Request, res: Response) => {
    const listName = req.params.listName;
    const newTodo: TodoItem = todoSchema.parse(req.body);
    todoStore.add(listName, newTodo);
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
    res.status(201).send(newTodo);
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
