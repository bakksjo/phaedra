import { z } from 'zod';

export const todoSchema = z.object({
  createdByUser: z.string(),
  id: z.string().uuid(), // aka GUID
  lastModifiedTime: z.string().datetime(), // ISO 8601 string
  state: z.enum(['TODO', 'ONGOING', 'DONE']),
  title: z.string(),
});

export const listOfTodosSchema = z.array(todoSchema);

export const fetchTodosResponseSchema = listOfTodosSchema;
