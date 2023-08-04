const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
require('./ipc.js')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 950,
    height: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // Important for IPC (more secure https://www.electronjs.org/docs/tutorial/context-isolation)
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    })
  )
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})