import Express from 'express';
import { z } from 'zod';

const todoSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean()
});

type TodoItem = z.infer<typeof todoSchema>;

const preExistingTodos: TodoItem[] = [
  { userId: 1, id: 1, title: "delectus aut autem", completed: false },
  { userId: 1, id: 2, title: "quis ut nam facilis et officia qui", completed: false },
  { userId: 1, id: 3, title: "fugiat veniam minus", completed: false }
];

function configureServiceEndpoints(apiServer: Express.Application) {
  apiServer.get('/todos', (request, response) => {
    response.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    response.send(preExistingTodos);
  });

  apiServer.post('/todos', (request, response) => {
    const requestTodo = todoSchema.parse(request.body);
    console.log(`Received new todo: ${JSON.stringify(requestTodo)}`);
    response.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    response.send(requestTodo);
  });
}

export function startTodoService(port: number) {
  const express = Express();
  configureServiceEndpoints(express);
  const server = express.listen(port);
  return server;
}
