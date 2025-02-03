import { z } from 'zod';
import {
  zTodoItemState,
  zStoredTodoItem,
  zFetchTodosResponse,
  zStoredTodoItemMetadata,
  zTodoItemData,
  zTodoItemId,
  zRevision,
  zCreateTodoRequest,
  zHttpErrorBody
} from './phaedra-schemas';

export type TodoItemId = z.infer<typeof zTodoItemId>;
export type TodoItemData = z.infer<typeof zTodoItemData>;
export type TodoState = z.infer<typeof zTodoItemState>;
export type StoredTodoItemMetadata = z.infer<typeof zStoredTodoItemMetadata>;
export type StoredTodoItem = z.infer<typeof zStoredTodoItem>;
export type Revision = z.infer<typeof zRevision>;

export type HttpErrorBody = z.infer<typeof zHttpErrorBody>;
export type CreateTodoRequest = z.infer<typeof zCreateTodoRequest>;
export type FetchTodosResponse = z.infer<typeof zFetchTodosResponse>;
