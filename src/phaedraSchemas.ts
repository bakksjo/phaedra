import { z } from 'zod';

export const todoSchema = z.object({
  createdByUser: z.string(),
  id: z.string(), // GUID
  lastModifiedTime: z.string().datetime(), // ISO 8601 string
  state: z.enum(['TODO', 'ONGOING', 'DONE']),
  title: z.string(),
});
export type TodoItem = z.infer<typeof todoSchema>;

export const fetchTodosResponseSchema = z.array(todoSchema);
export type FetchTodosResponse = z.infer<typeof fetchTodosResponseSchema>;
