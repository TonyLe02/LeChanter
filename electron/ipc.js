const { ipcMain, shell } = require("electron");

// * IPC Example * //

ipcMain.handle("message", async (event, arg) => {
  console.log("Message received from renderer:", arg);
});

// Handle opening external URLs (for Spotify OAuth)
ipcMain.handle("open-external", async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error("Failed to open external URL:", error);
    return { success: false, error: error.message };
  }
});
