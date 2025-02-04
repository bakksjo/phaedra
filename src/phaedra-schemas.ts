import { z } from 'zod';

export const zTodoItemId = z.string().uuid(); // aka GUID
export const zUsername = z.string().trim().nonempty();
export const zTimestamp = z.string().datetime(); // ISO 8601 string
export const zRevision = z.number().int().positive();
export const zTodoItemState = z.enum(['TODO', 'ONGOING', 'DONE']);
export const zTodoItemTitle = z.string().trim().nonempty();

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

export const zTodoArray = z.array(zStoredTodoItem);

export const zTodoStoreExport = z.record(zTodoArray);

// In HTTP requests and responses:

export const zIfMatchHeader = z.coerce.number().int().positive();

export const zErrorBody = z.object({
  message: z.string(),
});

export const zCreateTodoRequest = z.object({
  creator: zUsername,
  title: zTodoItemTitle,
});

export const zUpdateTodoRequest = zTodoItemData;

export const zFetchTodosResponse = zTodoArray;
