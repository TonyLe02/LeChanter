const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

let mainWindow;
let resizeData = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    frame: false,
    resizable: true,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../src/preload.js"),
    },
  });

  // Load the app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

// Handle resize start
ipcMain.on("start-resize", (event, direction) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const bounds = win.getBounds();
    resizeData = {
      direction,
      startBounds: bounds,
      startMouse: null,
    };
  }
});

// Handle resize updates
ipcMain.on("update-resize", (event, direction, mousePos) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win && resizeData) {
    if (!resizeData.startMouse) {
      resizeData.startMouse = mousePos;
      return;
    }

    const deltaX = mousePos.x - resizeData.startMouse.x;
    const deltaY = mousePos.y - resizeData.startMouse.y;
    const bounds = { ...resizeData.startBounds };

    switch (direction) {
      case "se":
        bounds.width = Math.max(200, resizeData.startBounds.width + deltaX);
        bounds.height = Math.max(150, resizeData.startBounds.height + deltaY);
        break;
      case "sw":
        bounds.width = Math.max(200, resizeData.startBounds.width - deltaX);
        bounds.height = Math.max(150, resizeData.startBounds.height + deltaY);
        bounds.x = resizeData.startBounds.x + deltaX;
        break;
      case "ne":
        bounds.width = Math.max(200, resizeData.startBounds.width + deltaX);
        bounds.height = Math.max(150, resizeData.startBounds.height - deltaY);
        bounds.y = resizeData.startBounds.y + deltaY;
        break;
      case "nw":
        bounds.width = Math.max(200, resizeData.startBounds.width - deltaX);
        bounds.height = Math.max(150, resizeData.startBounds.height - deltaY);
        bounds.x = resizeData.startBounds.x + deltaX;
        bounds.y = resizeData.startBounds.y + deltaY;
        break;
    }

    win.setBounds(bounds);
  }
});

// Handle resize end
ipcMain.on("end-resize", () => {
  resizeData = null;
});

ipcMain.handle("open-external", async (event, url) => {
  await shell.openExternal(url);
});

// Window control handlers
ipcMain.on("minimize-window", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.minimize();
  }
});

ipcMain.on("maximize-window", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on("close-window", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
});

// Transparency handler
ipcMain.on("set-transparency", (event, transparent) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (transparent) {
      // Make window transparent and remove background
      win.setBackgroundColor("#00000000");
      win.setOpacity(0.95);
      // Optional: remove window decorations for cleaner overlay
      // win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      // Restore normal window
      win.setBackgroundColor("#1a1a1a");
      win.setOpacity(1.0);
      // win.setIgnoreMouseEvents(false);
    }
  }
});
