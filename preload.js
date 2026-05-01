const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listFiles: () => ipcRenderer.invoke('list-files'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),
  createFile: (name) => ipcRenderer.invoke('create-file', name),
  renameFile: (filePath, newName) => ipcRenderer.invoke('rename-file', { filePath, newName }),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  importFile: (name, content) => ipcRenderer.invoke('import-file', { name, content }),
  notesDir: () => ipcRenderer.invoke('notes-dir'),
  onNotesChanged: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('notes-dir-changed', handler);
    return () => ipcRenderer.removeListener('notes-dir-changed', handler);
  }
});
