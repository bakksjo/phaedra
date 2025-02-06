# phaedra
Sample React/TypeScript/Node/Electron TODO list app.

# Building
```
npm install
npm package
```

The binary will be found in
```
out/phaedra-<platform>/
```

# Running
Example (Windows):
```
out/phaedra-win32-x64/phaedra.exe --numWindows=2
```

## Configuration
The Phaedra app takes the following command-line arguments:

```
--servicePort=<number>
```
The port where the REST service will run. Default: 3001.

```
--storePath=<path-to-file>
```
TODOs will be loaded into the service from this file on startup, and written out on exit. Default: ./phaedra-todos.json

```
--numWindows=<number (1-10)>
```
The number of UI windows to open. Having multiple windows is useful for observing real-time updates and concurrency handling.

```
--updateSlownessMs=<number>
```
This parameter will add a delay (in milliseconds) to each TODO write operation (create, update, delete) on the server. This is useful for observing the UI during pending updates.
