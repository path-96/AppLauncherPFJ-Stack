const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getIcon: (filePath) => ipcRenderer.invoke('get-icon', filePath),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog')
});