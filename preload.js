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
  projectDir: () => ipcRenderer.invoke('project-dir'),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  getRecentProjects: () => ipcRenderer.invoke('get-recent-projects'),
  pickProjectFolder: () => ipcRenderer.invoke('pick-project-folder'),
  openProject: (dir) => ipcRenderer.invoke('open-project', dir),
  onNotesChanged: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('notes-dir-changed', handler);
    return () => ipcRenderer.removeListener('notes-dir-changed', handler);
  },
  onSwitchProject: (cb) => {
    const handler = (_evt, dir) => cb(dir);
    ipcRenderer.on('switch-project', handler);
    return () => ipcRenderer.removeListener('switch-project', handler);
  },
  onPickAndSwitch: (cb) => {
    const handler = () => cb();
    ipcRenderer.on('pick-and-switch', handler);
    return () => ipcRenderer.removeListener('pick-and-switch', handler);
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
