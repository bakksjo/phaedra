import { app, BrowserWindow, ipcMain, session } from 'electron';
import { startTodoService } from './service/todo-service';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// app.commandLine.getSwitchValue() not working, need to parse manually.
function parseCommandLineArgs(): { [key: string]: string } {
  const args = process.argv.slice(1); // Skip the first argument (node executable path)
  const argsMap: { [key: string]: string } = {};

  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key.startsWith('--')) {
      argsMap[key.substring(2)] = value;
    }
  });

  return argsMap;
}

const args = parseCommandLineArgs();

const numWindowsArg = parseInt(args["numWindows"]) || 1;
const numberOfWindows = numWindowsArg >= 1 && numWindowsArg <= 10 ? numWindowsArg : 1;
const storePath = args["storePath"] || "phaedra-todos.json";
const updateSlownessMs = parseInt(args["updateSlownessMs"]) || 0;
const servicePort = parseInt(args["servicePort"]) || 3001;

console.log(`Using config equivalent to commandline: --servicePort=${servicePort} --storePath=${storePath} --numWindows=${numWindowsArg} --updateSlownessMs=${updateSlownessMs}`);

ipcMain.handle("get-app-data", () => {
  return { serviceBaseUrl: `http://localhost:${servicePort}` };
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      devTools: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

const todoServiceShutdown = startTodoService(servicePort, storePath, updateSlownessMs);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  for (let i = 0; i < numberOfWindows; i++) createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('All windows closed - closing server');
    todoServiceShutdown(() => {
      console.log('Server closed - exiting app');
      app.quit();
    });
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
