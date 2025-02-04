import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import { zCreateTodoRequest, zIfMatchHeader, zTodoStoreExport, zUpdateTodoRequest } from '../phaedra-schemas';
import { ErrorBody, StoredTodoItem, Revision } from '../phaedra.types';
import { zodErrorHandler } from './middleware/zodErrorHandler';
import { CreateTodoResult, ITodoStore, UpdateTodoResult } from '../store/todo-store';
import { EphemeralTodoStore } from '../store/ephemeral-todo-store';
import jsonTodos from './todos.json';
import { validateUpdate } from './validation';

const STORE_FILE_PATH = "src/service/todos.json";
const IF_MATCH_HEADER_DATA_TYPE = (() => { const revisionSentinel: Revision = 1; return typeof(revisionSentinel); })();

function createAndInitializeStore(): [ store: ITodoStore, storeShutdown: (callback: () => void) => void ] {
  const store = new EphemeralTodoStore();
  try {
    const preExistingTodos = zTodoStoreExport.parse(jsonTodos);
    store.importStore(preExistingTodos);
  } catch (err) {
    console.error('Error parsing pre-existing todos:', err);
  }
  const storeShutdown = (callback: () => void) => {
    const exportData = store.exportStore();
    const fileContents = JSON.stringify(exportData, null, 2);
    fs.writeFile(STORE_FILE_PATH, fileContents, callback);
    console.log('Store saved to disk:', STORE_FILE_PATH);
  };
  return [ store, storeShutdown ];
}

function configureServiceEndpoints(apiServer: express.Application, todoStore: ITodoStore) {
  apiServer.use(express.json());
  apiServer.use(zodErrorHandler);
  apiServer.use(cors());

  apiServer.get('/todo-lists', (req: Request, res: Response) => {
    const lists = todoStore.getLists();
    res.send(lists);
  });

  apiServer.get('/todo-lists/:listName/todos', (req: Request, res: Response<StoredTodoItem[] | ErrorBody>) => {
    const listName = req.params.listName;
    const todos = todoStore.list(listName);
    if (!todos) {
      res.status(404).send({ message: `List "${listName}" not found` });
      return
    }

    res.send(todos);
  });

  apiServer.post('/todo-lists/:listName/todos', (request: Request, response: Response<StoredTodoItem | ErrorBody>) => {
    const getResponseForCreateOperation = (op: CreateTodoResult): [number, StoredTodoItem | ErrorBody] => {
      switch (op.result) {
        case 'created': return [ 201, op.todo];
        case 'not-found': return [ 404, { message: `${op.missing} not found` }];
      }
    }

    const listName = request.params.listName;
    const newTodo = zCreateTodoRequest.parse(request.body);

    const op = todoStore.create(listName, newTodo);

    const [ httpStatus, responseBody ] = getResponseForCreateOperation(op);
    response.status(httpStatus).send(responseBody);
  });

  apiServer.put('/todo-lists/:listName/todos/:todoId', (request: Request, response: Response<StoredTodoItem | ErrorBody>) => {
    const getResponseForUpdateOperation = (op: UpdateTodoResult<string>): [number, StoredTodoItem | ErrorBody] => {
      switch (op.result) {
        case 'updated': return [ 200, op.todo];
        case 'not-found': return [ 404, { message: `${op.missing} not found` }];
        case 'conflict': return [ 409, op.currentItem ];
        case 'validation-failure': return [ 400, { message: op.validationError }];
      }
    }

    // Inputs
    const listName = request.params.listName;
    const todoId = request.params.todoId;
    let ifMatchHeader: number;
    try {
      ifMatchHeader = zIfMatchHeader.parse(request.headers['if-match']);
    } catch (err) {
      response.status(400).send({ message: `'If-Match: <${IF_MATCH_HEADER_DATA_TYPE}>' header required for update` });
      return;
    }
    const revision = ifMatchHeader;

    const updatedTodo = zUpdateTodoRequest.parse(request.body);

      const op = todoStore.update(listName, todoId, revision, updatedTodo, validateUpdate);

      const [ httpStatus, responseBody ] = getResponseForUpdateOperation(op);
      response.status(httpStatus).send(responseBody);
  });
}

export function startTodoService(port: number) {
  const restServer = express();
  const [store, storeShutdown] = createAndInitializeStore();
  configureServiceEndpoints(restServer, store);
  const runningServer = restServer.listen(port, () => {
    console.log(`Todo service running on port ${port}`);
  });

  const shutdownFunc = (callback?: (err?: Error) => void) => {
    storeShutdown(() => { runningServer.close(callback); });
  }
  return shutdownFunc;
}
