import { z } from 'zod';

export const todoSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean()
});
export type TodoItem = z.infer<typeof todoSchema>;

export const fetchTodosResponseSchema = z.array(todoSchema);
export type FetchTodosResponse = z.infer<typeof fetchTodosResponseSchema>;
