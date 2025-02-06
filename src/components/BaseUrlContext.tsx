import { createContext } from 'react';

export const defaultServiceBaseUrl = 'http://localhost:3001';
export const BaseUrlContext = createContext(defaultServiceBaseUrl);
