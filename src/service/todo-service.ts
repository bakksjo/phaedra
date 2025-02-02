import express, { Request, Response } from 'express';
import { todoSchema, TodoItem } from '../phaedraSchemas';
import { zodErrorHandler } from './middleware/zodErrorHandler';
import { ITodoStore } from '../store/todo-store';
import { EphemeralTodoStore } from '../store/ephemeral-todo-store';

const LIST_NAME = 'default'; // Hardcoded for now (TODO).

const createAndInitializeStore = (): ITodoStore => {
  const preExistingTodos: TodoItem[] = [
    {
      createdByUser: 'user1',
      id: '1',
      lastModifiedTime: new Date().toISOString(),
      state: 'TODO',
      title: 'delectus aut autem',
    },
    {
      createdByUser: 'user1',
      id: '2',
      lastModifiedTime: new Date().toISOString(),
      state: 'ONGOING',
      title: 'quis ut nam facilis et officia qui',
    },
    {
      createdByUser: 'user1',
      id: '3',
      lastModifiedTime: new Date().toISOString(),
      state: 'DONE',
      title: 'fugiat veniam minus',
    },
  ];
  
  const store: ITodoStore = new EphemeralTodoStore();
  preExistingTodos.forEach(todo => store.add(LIST_NAME, todo));
  return store;
}

function configureServiceEndpoints(apiServer: express.Application, todoStore: ITodoStore) {
  apiServer.use(express.json());
  apiServer.use(zodErrorHandler);

  apiServer.get('/todos', (req: Request, res: Response) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });
    const todos = todoStore.list(LIST_NAME);
    res.send(todos);
  });

  apiServer.post('/todos', (req: Request, res: Response) => {
    const newTodo: TodoItem = todoSchema.parse(req.body);
    todoStore.add(LIST_NAME, newTodo);
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
