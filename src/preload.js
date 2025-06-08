const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  startResize: (direction) => ipcRenderer.send("start-resize", direction),
  updateResize: (direction, position) =>
    ipcRenderer.send("update-resize", direction, position),
  endResize: () => ipcRenderer.send("end-resize"),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
  setTransparency: (transparent) =>
    ipcRenderer.send("set-transparency", transparent),
  onResizeStart: (callback) => ipcRenderer.on("resize-start", callback),
  onResizeEnd: (callback) => ipcRenderer.on("resize-end", callback),
});
