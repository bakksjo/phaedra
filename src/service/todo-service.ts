import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import { zCreateListRequest, zCreateTodoRequest, zIfMatchHeader, zTodoStoreExport, zUpdateTodoRequest } from '../phaedra-schemas';
import { ErrorBody, StoredTodoItem, Revision, StoreTodoEvent, StoreUpdateEvent, StoreListEvent } from '../phaedra.types';
import { zodErrorHandler } from './middleware/zodErrorHandler';
import { CreateTodoResult, ITodoStore, UpdateTodoResult, DeleteResult } from '../store/store-crud';
import { IListenableTodoStore, ListListener, TodoListener } from '../store/store-listen';
import { EphemeralTodoStore } from '../store/ephemeral-todo-store';
import jsonTodos from './todos.json';
import { validateUpdate } from './validation';

const STORE_FILE_PATH = "src/service/todos.json";
const UPDATE_SLOWNESS_MS = 1;
const IF_MATCH_HEADER_DATA_TYPE = (() => { const revisionSentinel: Revision = 1; return typeof(revisionSentinel); })();

function createAndInitializeStore(): [ store: ITodoStore & IListenableTodoStore, storeShutdown: (callback: () => void) => void ] {
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

function configureServiceEndpoints(apiServer: express.Application, todoStore: ITodoStore & IListenableTodoStore) {
  apiServer.use(express.json());
  apiServer.use(zodErrorHandler);
  apiServer.use(cors());

  apiServer.get('/todo-lists', (req: Request, res: Response) => {
    const lists = todoStore.getLists();
    res.send(lists);
  });

  apiServer.post('/todo-lists', (request: Request, response: Response<ErrorBody>) => {
    const requestData = zCreateListRequest.parse(request.body);
    const listName = requestData.listName;

    const result = todoStore.createList(listName);
    if (result === 'already-exists') {
      response.status(409).send({ message: `List '${listName}' already exists` });
      return;
    }

    response.status(201).send({ message: `List '${listName}' created` });
  });

  apiServer.get('/todo-lists/:listName/todos', (req: Request, res: Response<StoredTodoItem[] | ErrorBody>) => {
    const listName = req.params.listName;
    const result = todoStore.list(listName);
    if (result === 'list-not-found') {
      res.status(404).send({ message: `List "${listName}" not found` });
      return
    }

    res.status(201).send(result);
  });

  apiServer.post('/todo-lists/:listName/todos', (request: Request, response: Response<StoredTodoItem | ErrorBody>) => {
    const getResponseForCreateOperation = (op: CreateTodoResult): [number, StoredTodoItem | ErrorBody] => {
      switch (op.result) {
        case 'created': return [ 201, op.todo];
        case 'not-found': return [ 404, { message: `${op.what} not found` }];
      }
    }

    const listName = request.params.listName;
    const newTodo = zCreateTodoRequest.parse(request.body);

    setTimeout(() => {
      const op = todoStore.create(listName, newTodo);

      const [ httpStatus, responseBody ] = getResponseForCreateOperation(op);
      response.status(httpStatus).send(responseBody);
    }, UPDATE_SLOWNESS_MS);
  });

  apiServer.put('/todo-lists/:listName/todos/:todoId', (request: Request, response: Response<StoredTodoItem | ErrorBody>) => {
    const getResponseForUpdateOperation = (op: UpdateTodoResult<string>): [number, StoredTodoItem | ErrorBody] => {
      switch (op.result) {
        case 'updated': return [ 200, op.todo];
        case 'not-found': return [ 404, { message: `${op.what} not found` }];
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

    setTimeout(() => {
      const op = todoStore.update(listName, todoId, revision, updatedTodo, validateUpdate);

      const [ httpStatus, responseBody ] = getResponseForUpdateOperation(op);
      response.status(httpStatus).send(responseBody);
    }, UPDATE_SLOWNESS_MS);
  });

  apiServer.delete('/todo-lists/:listName/todos/:todoId', (request: Request, response: Response<StoredTodoItem | ErrorBody>) => {
    const getResponseForDeleteOperation = (op: DeleteResult): [number, StoredTodoItem | undefined] => {
      switch (op.result) {
        case 'deleted': return [204, undefined];
        case 'not-found': return [404, undefined];
        case 'conflict': return [409, op.currentItem];
      }
    }

    const listName = request.params.listName;
    const todoId = request.params.todoId;
    let ifMatchHeader: number;
    try {
      ifMatchHeader = zIfMatchHeader.parse(request.headers['if-match']);
    } catch (err) {
      response.status(400).send({ message: `'If-Match: <${IF_MATCH_HEADER_DATA_TYPE}>' header required for delete` });
      return;
    }
    const revision = ifMatchHeader;

    setTimeout(() => {
      const op = todoStore.delete(listName, todoId, revision);

      const [ httpStatus, responseBody ] = getResponseForDeleteOperation(op);
      response.status(httpStatus).send(responseBody);
    }, UPDATE_SLOWNESS_MS);
  });

  apiServer.get("/todo-lists/:listName/events", (request: Request, response: Response) => {
    const listName = request.params.listName;

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");

    const result = todoStore.list(listName);
    if (result === 'list-not-found') {
      response.status(404).send({ message: `List "${listName}" not found` });
      return;
    }

    // Send current items.
    result.forEach(todo => {
      const todoAsEvent: StoreUpdateEvent = { type: 'update', todo };
      response.write(`data: ${JSON.stringify(todoAsEvent)}\n\n`);
    });

    // Listen for future updates.
    const eventListener: TodoListener = (event: StoreTodoEvent) => {
      response.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const listenerHandle = todoStore.addTodoListener(listName, eventListener);

    console.log(`Client connected to '${listName}' event stream`);

    response.on("close", () => {
      console.log(`Client disconnected from '${listName}' event stream`);
      listenerHandle.remove();
      response.end();
    });
  });

  apiServer.get("/todo-lists/events", (request: Request, response: Response) => {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");

    const result = todoStore.getLists();

    // Send current items.
    result.forEach(listName => {
      const event: StoreListEvent = { type: 'created', list: listName };
      response.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    // Listen for future updates.
    const eventListener: ListListener = (event: StoreListEvent) => {
      response.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const listenerHandle = todoStore.addListListener(eventListener);

    console.log(`Client connected to list event stream`);

    response.on("close", () => {
      console.log(`Client disconnected from list event stream`);
      listenerHandle.remove();
      response.end();
    });
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
