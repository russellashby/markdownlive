const { app, BrowserWindow, ipcMain, dialog, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { watch } = require('fs');
const pty = require('node-pty');

let currentProjectDir = null;
let mainWindow = null;
let stopWatching = null;

const RECENTS_MAX = 10;
function recentsPath() {
  return path.join(app.getPath('userData'), 'recent-projects.json');
}

async function loadRecentProjects() {
  try {
    const raw = await fs.readFile(recentsPath(), 'utf8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const checked = [];
    for (const p of list) {
      try {
        const stat = await fs.stat(p);
        if (stat.isDirectory()) checked.push(p);
      } catch {}
    }
    return checked;
  } catch {
    return [];
  }
}

async function recordRecentProject(dir) {
  const existing = await loadRecentProjects();
  const next = [dir, ...existing.filter(p => p !== dir)].slice(0, RECENTS_MAX);
  try {
    await fs.writeFile(recentsPath(), JSON.stringify(next, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write recents:', err);
  }
}

function requireProject() {
  if (!currentProjectDir) throw new Error('No project open');
  return currentProjectDir;
}

function shortenHomePath(p) {
  const home = require('os').homedir();
  if (p.startsWith(home + path.sep) || p === home) return '~' + p.slice(home.length);
  return p;
}

async function buildAppMenu() {
  const isMac = process.platform === 'darwin';
  const recents = await loadRecentProjects();

  const recentSubmenu = recents.length === 0
    ? [{ label: 'No recent projects', enabled: false }]
    : recents.map(dir => ({
        label: shortenHomePath(dir),
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('switch-project', dir);
          }
        }
      }));

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder…',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('pick-and-switch');
            }
          }
        },
        {
          label: 'Open Recent',
          submenu: recentSubmenu
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        },
        ...(isMac ? [
          { type: 'separator' },
          {
            label: 'Substitutions',
            submenu: [
              { role: 'showSubstitutions' },
              { type: 'separator' },
              { role: 'toggleSmartQuotes' },
              { role: 'toggleSmartDashes' },
              { role: 'toggleTextReplacement' }
            ]
          },
          {
            label: 'Spelling and Grammar',
            submenu: [
              { role: 'showSpellingAndGrammar' },
              { role: 'startSpeaking' }
            ]
          }
        ] : [])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function attachContextMenu(win) {
  win.webContents.on('context-menu', (_event, params) => {
    const menu = new Menu();

    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => win.webContents.replaceMisspelling(suggestion)
      }));
    }

    if (params.misspelledWord) {
      if (params.dictionarySuggestions.length === 0) {
        menu.append(new MenuItem({ label: 'No suggestions', enabled: false }));
      }
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: 'Add to Dictionary',
        click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    if (params.isEditable) {
      menu.append(new MenuItem({ role: 'cut' }));
      menu.append(new MenuItem({ role: 'copy' }));
      menu.append(new MenuItem({ role: 'paste' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ role: 'selectAll' }));
    } else if (params.selectionText) {
      menu.append(new MenuItem({ role: 'copy' }));
    }

    if (menu.items.length > 0) menu.popup({ window: win });
  });
}

const WATCH_IGNORE_PREFIXES = ['node_modules', '.git', '.markdownlive'];

function isIgnoredWatchPath(filename) {
  if (!filename) return false;
  const segments = filename.split(path.sep);
  return WATCH_IGNORE_PREFIXES.includes(segments[0]);
}

function watchProject(win, dir) {
  let timer = null;
  let watcher;
  try {
    watcher = watch(dir, { persistent: true, recursive: true }, (_evt, filename) => {
      if (isIgnoredWatchPath(filename)) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!win.isDestroyed()) win.webContents.send('notes-dir-changed');
      }, 200);
    });
  } catch (err) {
    console.error('Failed to watch project dir:', err);
    return () => {};
  }
  return () => {
    clearTimeout(timer);
    try { watcher.close(); } catch {}
  };
}

async function setProject(dir) {
  if (stopWatching) {
    stopWatching();
    stopWatching = null;
  }
  currentProjectDir = dir;
  await recordRecentProject(dir);
  if (mainWindow && !mainWindow.isDestroyed()) {
    stopWatching = watchProject(mainWindow, dir);
  }
  await buildAppMenu();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1e2230',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true
    }
  });

  mainWindow.webContents.session.setSpellCheckerLanguages(['en-GB', 'en-US']);
  attachContextMenu(mainWindow);

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (stopWatching) {
      stopWatching();
      stopWatching = null;
    }
  });
}

app.whenReady().then(async () => {
  await buildAppMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-current-project', () => currentProjectDir);

ipcMain.handle('get-recent-projects', () => loadRecentProjects());

ipcMain.handle('pick-project-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Pick a project folder',
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('open-project', async (_evt, dir) => {
  if (!dir) throw new Error('Missing project dir');
  const stat = await fs.stat(dir);
  if (!stat.isDirectory()) throw new Error('Not a directory');
  await setProject(dir);
  return dir;
});

async function walkProject(absDir, relDir, out) {
  let entries;
  try {
    entries = await fs.readdir(absDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (WATCH_IGNORE_PREFIXES.includes(entry.name)) continue;
      const subAbs = path.join(absDir, entry.name);
      const subRel = relDir ? `${relDir}/${entry.name}` : entry.name;
      await walkProject(subAbs, subRel, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const full = path.join(absDir, entry.name);
      const stat = await fs.stat(full);
      out.push({
        name: entry.name.replace(/\.md$/, ''),
        path: full,
        mtime: stat.mtimeMs,
        dir: relDir
      });
    }
  }
}

ipcMain.handle('list-files', async () => {
  const root = requireProject();
  const out = [];
  await walkProject(root, '', out);
  return out;
});

ipcMain.handle('read-file', async (_evt, filePath) => {
  return await fs.readFile(filePath, 'utf8');
});

ipcMain.handle('save-file', async (_evt, { filePath, content }) => {
  await fs.writeFile(filePath, content, 'utf8');
  return true;
});

ipcMain.handle('create-file', async (_evt, name) => {
  const root = requireProject();
  const safeName = (name || 'Untitled').replace(/[\\/:*?"<>|]/g, '').trim() || 'Untitled';
  let target = path.join(root, `${safeName}.md`);
  let counter = 1;
  while (true) {
    try {
      await fs.access(target);
      target = path.join(root, `${safeName} ${counter}.md`);
      counter++;
    } catch {
      break;
    }
  }
  await fs.writeFile(target, '', 'utf8');
  return target;
});

ipcMain.handle('rename-file', async (_evt, { filePath, newName }) => {
  const safeName = (newName || 'Untitled').replace(/[\\/:*?"<>|]/g, '').trim() || 'Untitled';
  const dir = path.dirname(filePath);
  const newPath = path.join(dir, `${safeName}.md`);
  if (newPath === filePath) return filePath;
  try {
    await fs.access(newPath);
    return filePath;
  } catch {
    await fs.rename(filePath, newPath);
    return newPath;
  }
});

ipcMain.handle('delete-file', async (_evt, filePath) => {
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Cancel', 'Delete'],
    defaultId: 0,
    cancelId: 0,
    message: 'Delete this note?',
    detail: path.basename(filePath)
  });
  if (response === 1) {
    await fs.unlink(filePath);
    return true;
  }
  return false;
});

ipcMain.handle('import-file', async (_evt, { name, content }) => {
  const root = requireProject();
  const stripped = (name || 'Untitled').replace(/\.md$/i, '');
  const safeName = stripped.replace(/[\\/:*?"<>|]/g, '').trim() || 'Untitled';
  let target = path.join(root, `${safeName}.md`);
  let counter = 1;
  while (true) {
    try {
      await fs.access(target);
      target = path.join(root, `${safeName} ${counter}.md`);
      counter++;
    } catch {
      break;
    }
  }
  await fs.writeFile(target, content ?? '', 'utf8');
  return target;
});

ipcMain.handle('save-image', async (_evt, { name, bytes }) => {
  const root = requireProject();
  const imagesDir = path.join(root, '.markdownlive', 'images');
  await fs.mkdir(imagesDir, { recursive: true });
  const ext = (path.extname(name || '') || '.png').toLowerCase();
  const baseRaw = path.basename(name || '', path.extname(name || ''));
  const safeBase = baseRaw.replace(/[\\/:*?"<>|]/g, '').trim() || 'image';
  let target = path.join(imagesDir, `${safeBase}${ext}`);
  let counter = 1;
  while (true) {
    try {
      await fs.access(target);
      target = path.join(imagesDir, `${safeBase}-${counter}${ext}`);
      counter++;
    } catch {
      break;
    }
  }
  await fs.writeFile(target, Buffer.from(bytes));
  return `.markdownlive/images/${path.basename(target)}`;
});

ipcMain.handle('project-dir', () => currentProjectDir);

const ptyProcesses = new Map();
let nextPtyId = 1;

function shellCommand() {
  return process.env.SHELL || (process.platform === 'win32' ? 'powershell.exe' : '/bin/zsh');
}

ipcMain.handle('terminal-spawn', (evt, { cols, rows }) => {
  const cwd = requireProject();
  const id = nextPtyId++;
  const proc = pty.spawn(shellCommand(), [], {
    name: 'xterm-color',
    cols: cols || 80,
    rows: rows || 24,
    cwd,
    env: process.env
  });
  ptyProcesses.set(id, proc);

  proc.onData((data) => {
    if (!evt.sender.isDestroyed()) evt.sender.send(`terminal-data:${id}`, data);
  });
  proc.onExit(({ exitCode }) => {
    ptyProcesses.delete(id);
    if (!evt.sender.isDestroyed()) evt.sender.send(`terminal-exit:${id}`, exitCode);
  });

  return id;
});

ipcMain.on('terminal-write', (_evt, { id, data }) => {
  const proc = ptyProcesses.get(id);
  if (proc) proc.write(data);
});

ipcMain.on('terminal-resize', (_evt, { id, cols, rows }) => {
  const proc = ptyProcesses.get(id);
  if (proc) {
    try { proc.resize(cols, rows); } catch {}
  }
});

ipcMain.on('terminal-kill', (_evt, { id }) => {
  const proc = ptyProcesses.get(id);
  if (proc) {
    try { proc.kill(); } catch {}
    ptyProcesses.delete(id);
  }
});

app.on('before-quit', () => {
  for (const proc of ptyProcesses.values()) {
    try { proc.kill(); } catch {}
  }
  ptyProcesses.clear();
});
