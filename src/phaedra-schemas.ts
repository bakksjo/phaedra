import { z } from 'zod';

export const zTodoItemId = z.string().uuid(); // aka GUID
export const zUsername = z.string().trim().nonempty();
export const zTimestamp = z.string().datetime(); // ISO 8601 string
export const zRevision = z.number().int().positive();
export const zTodoItemState = z.enum(['TODO', 'ONGOING', 'DONE']);
export const zTodoItemTitle = z.string().trim().nonempty();
export const zListname = z.string().trim().nonempty();

export const zTodoItemData = z.object({
  state: zTodoItemState,
  title: zTodoItemTitle,
  createdByUser: zUsername,
});

export const zStoredTodoItemMetadata = z.object({
  id: zTodoItemId,
  lastModifiedTime: zTimestamp,
  revision: zRevision,
});

export const zStoredTodoItem = z.object({
  data: zTodoItemData,
  meta: zStoredTodoItemMetadata,
});

export const zStoreUpdateEvent = z.object({
  type: z.literal("update"),
  todo: zStoredTodoItem,
});

export const zStoreDeleteEvent = z.object({
  type: z.literal("delete"),
  id: zTodoItemId,
});

export const zStoreTodoEvent = z.discriminatedUnion("type", [
  zStoreUpdateEvent,
  zStoreDeleteEvent,
]);

export const zStoreListEvent = z.object({
  type: z.enum(['created', 'deleted']),
  list: z.string().trim().nonempty(),
});

export const zTodoArray = z.array(zStoredTodoItem);

export const zTodoStoreExport = z.record(zTodoArray);

// In HTTP requests and responses:

export const zIfMatchHeader = z.coerce.number().int().positive();

export const zErrorBody = z.object({
  message: z.string(),
});

export const zCreateListRequest = z.object({
  listName: zListname,
});

export const zCreateTodoRequest = zTodoItemData;

export const zUpdateTodoRequest = zTodoItemData;

export const zFetchTodosResponse = zTodoArray;
