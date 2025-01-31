import express, { Request, Response } from 'express';
import { todoSchema, TodoItem } from '../phaedraSchemas';
import { zodErrorHandler } from './middleware/zodErrorHandler';

const preExistingTodos: TodoItem[] = [
  { userId: 1, id: 1, title: "delectus aut autem", completed: false },
  { userId: 1, id: 2, title: "quis ut nam facilis et officia qui", completed: false },
  { userId: 1, id: 3, title: "fugiat veniam minus", completed: false }
];

function configureServiceEndpoints(apiServer: express.Application) {
  apiServer.use(express.json());

  apiServer.get('/todos', (req: Request, res: Response) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    res.send(preExistingTodos);
  });

  apiServer.post('/todos', (req: Request, res: Response) => {
    // TODO: Validate content type of request.
    const requestTodo = todoSchema.parse(req.body);
    console.log(`Received new todo: ${JSON.stringify(requestTodo)}`);
    // TODO: Save the new todo.
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    res.send(requestTodo);
  });

  apiServer.use(zodErrorHandler);
}

export function startTodoService(port: number) {
  const app = express();
  configureServiceEndpoints(app);
  const server = app.listen(port, () => {
    console.log(`Todo service running on port ${port}`);
  });
  return server;
}
