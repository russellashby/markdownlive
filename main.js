const { app, BrowserWindow, ipcMain, dialog, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { watch } = require('fs');
const os = require('os');
const pty = require('node-pty');

const NOTES_DIR = path.join(os.homedir(), 'MarkdownNotes');

async function ensureNotesDir() {
  try {
    await fs.mkdir(NOTES_DIR, { recursive: true });
    const files = await fs.readdir(NOTES_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    if (mdFiles.length === 0) {
      const welcomePath = path.join(NOTES_DIR, 'Getting Started.md');
      const welcome = `# Hello, stranger!

Welcome to your markdown editor. This is a simple text editor, but it's so much more, and some things... may not work the way you expect.

Before you start exploring, you should know how to do a few things.

## You need to understand this

Anything wrapped in **double asterisks** will appear bold. _Single underscores_ produce italics.

## What's a focus?

A focus lets you write while everything else fades away. Try writing a long first item, and a second one. To create a list, just type a star or dash, then a space.

- Remember to have fun
- The team behind Ulysses

> A quote like this is a great way to highlight something important.

\`Inline code\` and code blocks are also supported:

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`
`;
      await fs.writeFile(welcomePath, welcome, 'utf8');
    }
  } catch (err) {
    console.error('Failed to ensure notes dir:', err);
  }
}

function buildAppMenu() {
  const isMac = process.platform === 'darwin';
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

function watchNotesDir(win) {
  let timer = null;
  let watcher;
  try {
    watcher = watch(NOTES_DIR, { persistent: true, recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!win.isDestroyed()) win.webContents.send('notes-dir-changed');
      }, 200);
    });
  } catch (err) {
    console.error('Failed to watch notes dir:', err);
    return;
  }
  win.on('closed', () => {
    clearTimeout(timer);
    try { watcher.close(); } catch {}
  });
}

function createWindow() {
  const win = new BrowserWindow({
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

  win.webContents.session.setSpellCheckerLanguages(['en-GB', 'en-US']);
  attachContextMenu(win);
  watchNotesDir(win);

  win.loadFile('index.html');
}

app.whenReady().then(async () => {
  buildAppMenu();
  await ensureNotesDir();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('list-files', async () => {
  const rootEntries = await fs.readdir(NOTES_DIR, { withFileTypes: true });
  const files = [];
  for (const entry of rootEntries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const full = path.join(NOTES_DIR, entry.name);
      const stat = await fs.stat(full);
      files.push({
        name: entry.name.replace(/\.md$/, ''),
        path: full,
        mtime: stat.mtimeMs,
        folder: null
      });
    } else if (entry.isDirectory()) {
      const folderPath = path.join(NOTES_DIR, entry.name);
      let subEntries;
      try {
        subEntries = await fs.readdir(folderPath, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const sub of subEntries) {
        if (sub.isFile() && sub.name.endsWith('.md')) {
          const full = path.join(folderPath, sub.name);
          const stat = await fs.stat(full);
          files.push({
            name: sub.name.replace(/\.md$/, ''),
            path: full,
            mtime: stat.mtimeMs,
            folder: entry.name
          });
        }
      }
    }
  }
  return files;
});

ipcMain.handle('read-file', async (_evt, filePath) => {
  return await fs.readFile(filePath, 'utf8');
});

ipcMain.handle('save-file', async (_evt, { filePath, content }) => {
  await fs.writeFile(filePath, content, 'utf8');
  return true;
});

ipcMain.handle('create-file', async (_evt, name) => {
  const safeName = (name || 'Untitled').replace(/[\\/:*?"<>|]/g, '').trim() || 'Untitled';
  let target = path.join(NOTES_DIR, `${safeName}.md`);
  let counter = 1;
  while (true) {
    try {
      await fs.access(target);
      target = path.join(NOTES_DIR, `${safeName} ${counter}.md`);
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
  const stripped = (name || 'Untitled').replace(/\.md$/i, '');
  const safeName = stripped.replace(/[\\/:*?"<>|]/g, '').trim() || 'Untitled';
  let target = path.join(NOTES_DIR, `${safeName}.md`);
  let counter = 1;
  while (true) {
    try {
      await fs.access(target);
      target = path.join(NOTES_DIR, `${safeName} ${counter}.md`);
      counter++;
    } catch {
      break;
    }
  }
  await fs.writeFile(target, content ?? '', 'utf8');
  return target;
});

ipcMain.handle('save-image', async (_evt, { name, bytes }) => {
  const imagesDir = path.join(NOTES_DIR, 'images');
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
  return `images/${path.basename(target)}`;
});

ipcMain.handle('notes-dir', () => NOTES_DIR);

const ptyProcesses = new Map();
let nextPtyId = 1;

function shellCommand() {
  return process.env.SHELL || (process.platform === 'win32' ? 'powershell.exe' : '/bin/zsh');
}

ipcMain.handle('terminal-spawn', (evt, { cols, rows }) => {
  const id = nextPtyId++;
  const proc = pty.spawn(shellCommand(), [], {
    name: 'xterm-color',
    cols: cols || 80,
    rows: rows || 24,
    cwd: NOTES_DIR,
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
