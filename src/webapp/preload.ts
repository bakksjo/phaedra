// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge } from 'electron';

// Abusing the window.process object; renderer's TS needs a known name.
contextBridge.exposeInMainWorld('process', { pid: process.pid });
