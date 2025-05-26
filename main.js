const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const extractIcon = require('extract-file-icon');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadURL('http://localhost:5000');
}

app.whenReady().then(createWindow);

ipcMain.handle('get-icon', (event, filePath) => {
  try {
    const iconBuffer = extractIcon(filePath, 32);
    if (iconBuffer) {
      return 'data:image/png;base64,' + iconBuffer.toString('base64');
    }
  } catch (e) {
    return null;
  }
  return null;
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});