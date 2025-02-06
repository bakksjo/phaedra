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
  zErrorBody,
  zTodoStoreExport,
  zStoreDeleteEvent,
  zStoreUpdateEvent,
  zStoreEvent
} from './phaedra-schemas';

export type TodoItemId = z.infer<typeof zTodoItemId>;
export type TodoItemData = z.infer<typeof zTodoItemData>;
export type TodoState = z.infer<typeof zTodoItemState>;
export type StoredTodoItemMetadata = z.infer<typeof zStoredTodoItemMetadata>;
export type StoredTodoItem = z.infer<typeof zStoredTodoItem>;
export type Revision = z.infer<typeof zRevision>;

export type StoreUpdateEvent = z.infer<typeof zStoreUpdateEvent>;
export type StoreDeleteEvent = z.infer<typeof zStoreDeleteEvent>;
export type StoreEvent = z.infer<typeof zStoreEvent>;

export type TodoStoreExport = z.infer<typeof zTodoStoreExport>;

export type ErrorBody = z.infer<typeof zErrorBody>;
export type CreateTodoRequest = z.infer<typeof zCreateTodoRequest>;
export type FetchTodosResponse = z.infer<typeof zFetchTodosResponse>;
