const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  listFiles: () => ipcRenderer.invoke('list-files'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),
  createFile: (name) => ipcRenderer.invoke('create-file', name),
  renameFile: (filePath, newName) => ipcRenderer.invoke('rename-file', { filePath, newName }),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  importFile: (name, content) => ipcRenderer.invoke('import-file', { name, content }),
  saveImage: (name, bytes) => ipcRenderer.invoke('save-image', { name, bytes }),
  notesDir: () => ipcRenderer.invoke('notes-dir'),
  onNotesChanged: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('notes-dir-changed', handler);
    return () => ipcRenderer.removeListener('notes-dir-changed', handler);
  },
  terminal: {
    spawn: (cols, rows) => ipcRenderer.invoke('terminal-spawn', { cols, rows }),
    write: (id, data) => ipcRenderer.send('terminal-write', { id, data }),
    resize: (id, cols, rows) => ipcRenderer.send('terminal-resize', { id, cols, rows }),
    kill: (id) => ipcRenderer.send('terminal-kill', { id }),
    onData: (id, cb) => {
      const channel = `terminal-data:${id}`;
      const handler = (_evt, data) => cb(data);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    },
    onExit: (id, cb) => {
      const channel = `terminal-exit:${id}`;
      const handler = (_evt, code) => cb(code);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    }
  }
});
