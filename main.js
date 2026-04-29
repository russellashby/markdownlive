const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

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
      sandbox: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(async () => {
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
  const entries = await fs.readdir(NOTES_DIR, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const full = path.join(NOTES_DIR, entry.name);
      const stat = await fs.stat(full);
      files.push({
        name: entry.name.replace(/\.md$/, ''),
        path: full,
        mtime: stat.mtimeMs
      });
    }
  }
  files.sort((a, b) => b.mtime - a.mtime);
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
  const newPath = path.join(NOTES_DIR, `${safeName}.md`);
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

ipcMain.handle('notes-dir', () => NOTES_DIR);
