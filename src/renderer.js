import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

const fileListEl = document.getElementById('file-list');
const newFileBtn = document.getElementById('new-file-btn');
const titleInput = document.getElementById('title-input');
const editorRoot = document.getElementById('editor');
const wordCountEl = document.getElementById('word-count');
const saveStatusEl = document.getElementById('save-status');
const deleteBtn = document.getElementById('delete-btn');

const SAVE_DEBOUNCE_MS = 1500;

let crepe = null;
let currentFile = null;
let pendingMarkdown = null;
let lastSavedMarkdown = null;
let saveTimer = null;
let renameTimer = null;

function setSaveStatus(text) {
  saveStatusEl.textContent = text;
}

function updateWordCount(md) {
  const text = (md || '').replace(/[#*_`>~\-+\[\]()!]/g, ' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  wordCountEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
}

const COLLAPSED_KEY = 'mdedit.foldersCollapsed';

function getCollapsedFolders() {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveCollapsedFolders(set) {
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function toggleFolderCollapsed(folderName) {
  const collapsed = getCollapsedFolders();
  if (collapsed.has(folderName)) collapsed.delete(folderName);
  else collapsed.add(folderName);
  saveCollapsedFolders(collapsed);
}

function makeFileItem(file, activatePath) {
  const li = document.createElement('li');
  li.className = 'file-item';
  li.dataset.path = file.path;
  li.textContent = file.name;
  if (currentFile && currentFile.path === file.path) li.classList.add('active');
  if (activatePath && activatePath === file.path) li.classList.add('active');
  li.addEventListener('click', () => openFile(file));
  return li;
}

async function loadFiles(activatePath) {
  const files = await window.api.listFiles();
  files.sort((a, b) => b.mtime - a.mtime);
  const rootFiles = files.filter(f => !f.folder);
  const folderMap = new Map();
  for (const file of files) {
    if (!file.folder) continue;
    if (!folderMap.has(file.folder)) folderMap.set(file.folder, []);
    folderMap.get(file.folder).push(file);
  }
  const folderNames = Array.from(folderMap.keys()).sort((a, b) => a.localeCompare(b));
  const collapsed = getCollapsedFolders();

  fileListEl.innerHTML = '';
  for (const file of rootFiles) {
    fileListEl.appendChild(makeFileItem(file, activatePath));
  }
  for (const name of folderNames) {
    const isCollapsed = collapsed.has(name);
    const group = document.createElement('li');
    group.className = 'folder-group';
    if (isCollapsed) group.classList.add('collapsed');

    const header = document.createElement('div');
    header.className = 'folder-header';
    header.innerHTML = '<span class="folder-chevron">▾</span>';
    const label = document.createElement('span');
    label.className = 'folder-name';
    label.textContent = name;
    header.appendChild(label);
    header.addEventListener('click', () => {
      toggleFolderCollapsed(name);
      group.classList.toggle('collapsed');
    });
    group.appendChild(header);

    const sub = document.createElement('ul');
    sub.className = 'folder-files';
    for (const file of folderMap.get(name)) {
      sub.appendChild(makeFileItem(file, activatePath));
    }
    group.appendChild(sub);
    fileListEl.appendChild(group);
  }

  if (!currentFile && files.length > 0) {
    await openFile(files[0]);
  } else if (currentFile) {
    const stillExists = files.find(f => f.path === currentFile.path);
    if (!stillExists) {
      if (files.length > 0) await openFile(files[0]);
      else await clearEditor();
    }
  }
}

function setActiveItem(filePath) {
  document.querySelectorAll('.file-item').forEach(el => {
    el.classList.toggle('active', el.dataset.path === filePath);
  });
}

async function destroyCrepe() {
  if (crepe) {
    await flushSave();
    try { await crepe.destroy(); } catch {}
    crepe = null;
  }
  editorRoot.innerHTML = '';
}

async function openFile(file) {
  if (currentFile && currentFile.path === file.path) return;
  await destroyCrepe();
  const content = await window.api.readFile(file.path);
  currentFile = { path: file.path, name: file.name };
  pendingMarkdown = content;
  lastSavedMarkdown = content;
  titleInput.value = file.name;
  setActiveItem(file.path);
  await mountCrepe(content);
  updateWordCount(content);
  setSaveStatus('Saved');
}

async function clearEditor() {
  await destroyCrepe();
  currentFile = null;
  pendingMarkdown = null;
  lastSavedMarkdown = null;
  titleInput.value = '';
  updateWordCount('');
}

async function mountCrepe(initial) {
  crepe = new Crepe({
    root: editorRoot,
    defaultValue: initial || ''
  });

  crepe.on(listener => {
    listener.markdownUpdated((_ctx, md) => {
      if (md === pendingMarkdown) return;
      pendingMarkdown = md;
      updateWordCount(md);
      scheduleSave();
    });
  });

  await crepe.create();
}

function scheduleSave() {
  if (!currentFile) return;
  if (pendingMarkdown === lastSavedMarkdown) return;
  setSaveStatus('Unsaved');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(doSave, SAVE_DEBOUNCE_MS);
}

async function doSave() {
  saveTimer = null;
  if (!currentFile || pendingMarkdown == null) return;
  if (pendingMarkdown === lastSavedMarkdown) {
    setSaveStatus('Saved');
    return;
  }
  setSaveStatus('Saving…');
  const snapshot = pendingMarkdown;
  await window.api.saveFile(currentFile.path, snapshot);
  lastSavedMarkdown = snapshot;
  if (pendingMarkdown === lastSavedMarkdown) setSaveStatus('Saved');
}

async function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    await doSave();
  }
}

titleInput.addEventListener('input', () => {
  if (!currentFile) return;
  setSaveStatus('Saving…');
  clearTimeout(renameTimer);
  renameTimer = setTimeout(async () => {
    const newName = titleInput.value.trim() || 'Untitled';
    if (newName === currentFile.name) {
      setSaveStatus('Saved');
      return;
    }
    const newPath = await window.api.renameFile(currentFile.path, newName);
    currentFile.path = newPath;
    currentFile.name = newName;
    await loadFiles(newPath);
    setSaveStatus('Saved');
  }, 500);
});

newFileBtn.addEventListener('click', async () => {
  await flushSave();
  const newPath = await window.api.createFile('Untitled');
  currentFile = null;
  await loadFiles(newPath);
  const created = (await window.api.listFiles()).find(f => f.path === newPath);
  if (created) {
    await openFile(created);
    titleInput.focus();
    titleInput.select();
  }
});

deleteBtn.addEventListener('click', async () => {
  if (!currentFile) return;
  const deleted = await window.api.deleteFile(currentFile.path);
  if (deleted) {
    await clearEditor();
    await loadFiles();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    flushSave();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault();
    newFileBtn.click();
  }
});

window.addEventListener('blur', () => { flushSave(); });
window.addEventListener('beforeunload', () => {
  if (saveTimer) doSave();
});

function eventHasFiles(e) {
  return !!e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
}

function isMarkdownFile(file) {
  return /\.md$/i.test(file.name) || file.type === 'text/markdown';
}

document.addEventListener('dragover', (e) => {
  if (!eventHasFiles(e)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}, true);

document.addEventListener('drop', async (e) => {
  if (!eventHasFiles(e)) return;
  e.preventDefault();
  e.stopPropagation();

  const files = Array.from(e.dataTransfer.files || []).filter(isMarkdownFile);
  if (files.length === 0) return;

  await flushSave();

  let lastImportedPath = null;
  for (const file of files) {
    const content = await file.text();
    const baseName = file.name.replace(/\.md$/i, '');
    lastImportedPath = await window.api.importFile(baseName, content);
  }

  if (lastImportedPath) {
    currentFile = null;
    await loadFiles(lastImportedPath);
    const imported = (await window.api.listFiles()).find(f => f.path === lastImportedPath);
    if (imported) await openFile(imported);
  }
}, true);

window.api.onNotesChanged(() => { loadFiles(); });

loadFiles();
