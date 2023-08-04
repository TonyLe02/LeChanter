const { ipcMain } = require('electron');

// * IPC Example * //

ipcMain.handle('message', async (event, arg) => {
    console.log('Message received from renderer:', arg);
});