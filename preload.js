const { contextBridge, ipcRenderer } = require('electron');

// Way more secure practice than exposing the entire ipcRenderer object
// https://www.electronjs.org/docs/latest/tutorial/context-isolation#security-considerations

contextBridge.exposeInMainWorld('electronAPI', {
    messageToElectron: (arg) => ipcRenderer.invoke('message', arg)
});