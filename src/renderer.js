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

async function loadFiles(activatePath) {
  const files = await window.api.listFiles();
  fileListEl.innerHTML = '';
  for (const file of files) {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.dataset.path = file.path;
    li.textContent = file.name;
    if (currentFile && currentFile.path === file.path) li.classList.add('active');
    if (activatePath && activatePath === file.path) li.classList.add('active');
    li.addEventListener('click', () => openFile(file));
    fileListEl.appendChild(li);
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

loadFiles();
