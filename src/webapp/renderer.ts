/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { initTopLevelReactElement } from './init-top-level-react-element';

// Get a dynamic username based on the process ID for each window.
const username = 'pid' + window.process.pid;

async function fetchBaseUrl() {
  const data = await (window as any).electronAPI.getAppData();
  return data.serviceBaseUrl;
}

fetchBaseUrl().then((baseUrl) => {
  console.log('Renderer: Fetched baseUrl:', baseUrl);
  initTopLevelReactElement(username, baseUrl);
});
