import Express from 'express';

export function startTodoService(port: number) {
  const express = Express();
  express.get('/todos', (request, response) => {
    response.set({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    response.send(
      '[\
        {"userId": 1, "id": 1, "title": "delectus aut autem", "completed": false },\
        {"userId": 1, "id": 2, "title": "quis ut nam facilis et officia qui", "completed": false },\
        {"userId": 1, "id": 3, "title": "fugiat veniam minus", "completed": false }\
      ]');
    });
  const server = express.listen(port);
  return server;
}
