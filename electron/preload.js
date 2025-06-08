const { contextBridge, ipcRenderer } = require("electron");

// Way more secure practice than exposing the entire ipcRenderer object
// https://www.electronjs.org/docs/latest/tutorial/context-isolation#security-considerations

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  startResize: (direction) => ipcRenderer.send("start-resize", direction),
});
