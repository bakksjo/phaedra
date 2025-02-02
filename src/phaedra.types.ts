import { z } from 'zod';
import { todoSchema, fetchTodosResponseSchema } from './phaedra-schemas';

export type TodoItem = z.infer<typeof todoSchema>;
export type FetchTodosResponse = z.infer<typeof fetchTodosResponseSchema>;
