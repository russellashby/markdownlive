import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const fileListEl = document.getElementById('file-list');
const newFileBtn = document.getElementById('new-file-btn');
const titleInput = document.getElementById('title-input');
const editorRoot = document.getElementById('editor');
const wordCountEl = document.getElementById('word-count');
const saveStatusEl = document.getElementById('save-status');
const deleteBtn = document.getElementById('delete-btn');
const modeToggleBtn = document.getElementById('mode-toggle');
const appEl = document.querySelector('.app');
const sidebarCollapseBtn = document.getElementById('sidebar-collapse');
const sidebarExpandBtn = document.getElementById('sidebar-expand');
const terminalToggleBtn = document.getElementById('terminal-toggle');
const terminalHostEl = document.getElementById('terminal-host');
const terminalDividerEl = document.getElementById('terminal-divider');

const SAVE_DEBOUNCE_MS = 1500;
const MODE_KEY = 'mdedit.mode';
const SIDEBAR_KEY = 'mdedit.sidebarCollapsed';
const TERMINAL_VISIBLE_KEY = 'mdedit.terminalVisible';
const TERMINAL_WIDTH_KEY = 'mdedit.terminalWidth';
const TERMINAL_MIN_WIDTH = 240;
const TERMINAL_MAX_WIDTH = 900;

let mode = localStorage.getItem(MODE_KEY) === 'raw' ? 'raw' : 'live';
let crepe = null;
let rawEditor = null;
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
let activeProjectDir = null;

function readCollapsedMap() {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    return {};
  } catch {
    return {};
  }
}

function getCollapsedFolders() {
  if (!activeProjectDir) return new Set();
  const map = readCollapsedMap();
  return new Set(Array.isArray(map[activeProjectDir]) ? map[activeProjectDir] : []);
}

function saveCollapsedFolders(set) {
  if (!activeProjectDir) return;
  const map = readCollapsedMap();
  map[activeProjectDir] = Array.from(set);
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(map));
  } catch {}
}

function toggleFolderCollapsed(folderPath) {
  const collapsed = getCollapsedFolders();
  if (collapsed.has(folderPath)) collapsed.delete(folderPath);
  else collapsed.add(folderPath);
  saveCollapsedFolders(collapsed);
}

function makeFileItem(file, activatePath, depth) {
  const li = document.createElement('li');
  li.className = 'file-item';
  li.dataset.path = file.path;
  li.textContent = file.name;
  li.style.paddingLeft = `${14 + depth * 16}px`;
  if (currentFile && currentFile.path === file.path) li.classList.add('active');
  if (activatePath && activatePath === file.path) li.classList.add('active');
  li.addEventListener('click', () => openFile(file));
  return li;
}

function buildTree(files) {
  const root = { files: [], folders: new Map() };
  for (const file of files) {
    if (!file.dir) {
      root.files.push(file);
      continue;
    }
    const segments = file.dir.split('/');
    let node = root;
    for (const seg of segments) {
      if (!node.folders.has(seg)) {
        node.folders.set(seg, { files: [], folders: new Map() });
      }
      node = node.folders.get(seg);
    }
    node.files.push(file);
  }
  return root;
}

function renderTree(node, parentUl, activatePath, depth, collapsed, pathPrefix) {
  for (const file of node.files) {
    parentUl.appendChild(makeFileItem(file, activatePath, depth));
  }
  const folderNames = Array.from(node.folders.keys()).sort((a, b) => a.localeCompare(b));
  for (const name of folderNames) {
    const folderPath = pathPrefix ? `${pathPrefix}/${name}` : name;
    const isCollapsed = collapsed.has(folderPath);
    const group = document.createElement('li');
    group.className = 'folder-group';
    if (isCollapsed) group.classList.add('collapsed');

    const header = document.createElement('div');
    header.className = 'folder-header';
    header.style.paddingLeft = `${14 + depth * 16}px`;
    header.innerHTML = '<span class="folder-chevron">▾</span>';
    const label = document.createElement('span');
    label.className = 'folder-name';
    label.textContent = name;
    header.appendChild(label);
    header.addEventListener('click', () => {
      toggleFolderCollapsed(folderPath);
      group.classList.toggle('collapsed');
    });
    group.appendChild(header);

    const sub = document.createElement('ul');
    sub.className = 'folder-files';
    renderTree(node.folders.get(name), sub, activatePath, depth + 1, collapsed, folderPath);
    group.appendChild(sub);
    parentUl.appendChild(group);
  }
}

async function loadFiles(activatePath) {
  const files = await window.api.listFiles();
  files.sort((a, b) => b.mtime - a.mtime);
  const tree = buildTree(files);
  const collapsed = getCollapsedFolders();

  fileListEl.innerHTML = '';
  renderTree(tree, fileListEl, activatePath, 0, collapsed, '');

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

async function destroyEditor() {
  await flushSave();
  if (crepe) {
    try { await crepe.destroy(); } catch {}
    crepe = null;
  }
  rawEditor = null;
  editorRoot.innerHTML = '';
}

async function openFile(file) {
  if (currentFile && currentFile.path === file.path) return;
  await destroyEditor();
  const content = await window.api.readFile(file.path);
  currentFile = { path: file.path, name: file.name };
  pendingMarkdown = content;
  lastSavedMarkdown = content;
  titleInput.value = file.name;
  setActiveItem(file.path);
  await mountEditor(content);
  updateWordCount(content);
  setSaveStatus('Saved');
}

async function clearEditor() {
  await destroyEditor();
  currentFile = null;
  pendingMarkdown = null;
  lastSavedMarkdown = null;
  titleInput.value = '';
  updateWordCount('');
}

async function uploadImage(file) {
  const buffer = await file.arrayBuffer();
  return await window.api.saveImage(file.name, new Uint8Array(buffer));
}

async function proxyImageURL(url) {
  if (!url) return url;
  if (/^(https?:|data:|file:|blob:)/i.test(url)) return url;
  if (url.startsWith('/')) return url;
  const dir = await window.api.projectDir();
  return `file://${dir}/${url}`;
}

async function mountCrepe(initial) {
  crepe = new Crepe({
    root: editorRoot,
    defaultValue: initial || '',
    featureConfigs: {
      [Crepe.Feature.ImageBlock]: {
        onUpload: uploadImage,
        proxyDomURL: proxyImageURL
      }
    }
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

function mountRaw(initial) {
  rawEditor = document.createElement('textarea');
  rawEditor.className = 'raw-editor';
  rawEditor.spellcheck = true;
  rawEditor.value = initial || '';
  rawEditor.addEventListener('input', () => {
    if (rawEditor.value === pendingMarkdown) return;
    pendingMarkdown = rawEditor.value;
    updateWordCount(pendingMarkdown);
    scheduleSave();
  });
  editorRoot.appendChild(rawEditor);
}

async function mountEditor(initial) {
  if (mode === 'raw') mountRaw(initial);
  else await mountCrepe(initial);
}

function updateModeButton() {
  modeToggleBtn.classList.toggle('active', mode === 'raw');
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

modeToggleBtn.addEventListener('click', async () => {
  await flushSave();
  mode = mode === 'live' ? 'raw' : 'live';
  localStorage.setItem(MODE_KEY, mode);
  updateModeButton();
  if (currentFile) {
    const snapshot = pendingMarkdown ?? '';
    await destroyEditor();
    pendingMarkdown = snapshot;
    lastSavedMarkdown = snapshot;
    await mountEditor(snapshot);
    updateWordCount(snapshot);
    setSaveStatus('Saved');
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

  const mdFiles = Array.from(e.dataTransfer.files || []).filter(isMarkdownFile);
  if (mdFiles.length === 0) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  e.stopPropagation();
  await flushSave();

  let lastImportedPath = null;
  for (const file of mdFiles) {
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

async function reloadCurrentFileFromDisk() {
  if (!currentFile) return;
  if (pendingMarkdown !== lastSavedMarkdown) return;
  let onDisk;
  try {
    onDisk = await window.api.readFile(currentFile.path);
  } catch {
    return;
  }
  if (onDisk === lastSavedMarkdown) return;

  pendingMarkdown = onDisk;
  lastSavedMarkdown = onDisk;
  updateWordCount(onDisk);
  setSaveStatus('Saved');

  if (mode === 'raw' && rawEditor) {
    const start = rawEditor.selectionStart;
    const end = rawEditor.selectionEnd;
    rawEditor.value = onDisk;
    try { rawEditor.setSelectionRange(start, end); } catch {}
  } else {
    await destroyEditor();
    pendingMarkdown = onDisk;
    lastSavedMarkdown = onDisk;
    await mountEditor(onDisk);
  }
}

window.api.onNotesChanged(async () => {
  await loadFiles();
  await reloadCurrentFileFromDisk();
});

function setSidebarCollapsed(collapsed) {
  appEl.classList.toggle('sidebar-collapsed', collapsed);
  localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
}

sidebarCollapseBtn.addEventListener('click', () => setSidebarCollapsed(true));
sidebarExpandBtn.addEventListener('click', () => setSidebarCollapsed(false));

if (localStorage.getItem(SIDEBAR_KEY) === '1') {
  appEl.classList.add('sidebar-collapsed');
}

let terminal = null;
let terminalFit = null;
let terminalId = null;
let terminalDataUnsub = null;
let terminalExitUnsub = null;

function clampTerminalWidth(px) {
  return Math.max(TERMINAL_MIN_WIDTH, Math.min(TERMINAL_MAX_WIDTH, px));
}

function setTerminalWidth(px) {
  appEl.style.setProperty('--terminal-w', `${px}px`);
  localStorage.setItem(TERMINAL_WIDTH_KEY, String(px));
}

function fitTerminal() {
  if (!terminal || !terminalFit) return;
  if (!terminalHostEl.offsetWidth || !terminalHostEl.offsetHeight) return;
  try {
    terminalFit.fit();
    if (terminalId != null) {
      window.api.terminal.resize(terminalId, terminal.cols, terminal.rows);
    }
  } catch {}
}

async function ensureTerminalSpawned() {
  if (terminal) return;
  terminal = new Terminal({
    cursorBlink: true,
    fontFamily: 'SF Mono, Menlo, Monaco, Consolas, monospace',
    fontSize: 12.5,
    theme: { background: '#1e2230', foreground: '#e6e8ef' }
  });
  terminalFit = new FitAddon();
  terminal.loadAddon(terminalFit);
  terminal.open(terminalHostEl);

  const ro = new ResizeObserver(() => fitTerminal());
  ro.observe(terminalHostEl);
  fitTerminal();

  terminalId = await window.api.terminal.spawn(terminal.cols, terminal.rows);
  terminalDataUnsub = window.api.terminal.onData(terminalId, (data) => {
    terminal.write(data);
  });
  terminalExitUnsub = window.api.terminal.onExit(terminalId, () => {
    terminal.write('\r\n\x1b[33m[process exited — toggle off and on to restart]\x1b[0m\r\n');
    terminalDataUnsub && terminalDataUnsub();
    terminalExitUnsub && terminalExitUnsub();
    terminalId = null;
  });
  terminal.onData((data) => {
    if (terminalId != null) window.api.terminal.write(terminalId, data);
  });
}

function setTerminalVisible(visible) {
  appEl.classList.toggle('terminal-visible', visible);
  localStorage.setItem(TERMINAL_VISIBLE_KEY, visible ? '1' : '0');
  terminalToggleBtn.classList.toggle('active', visible);
  if (visible) {
    ensureTerminalSpawned().then(() => {
      requestAnimationFrame(fitTerminal);
      setTimeout(() => terminal && terminal.focus(), 50);
    });
  }
}

terminalToggleBtn.addEventListener('click', () => {
  setTerminalVisible(!appEl.classList.contains('terminal-visible'));
});

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === '`') {
    e.preventDefault();
    terminalToggleBtn.click();
  }
});

let dragStartX = 0;
let dragStartWidth = 0;

terminalDividerEl.addEventListener('mousedown', (e) => {
  if (!appEl.classList.contains('terminal-visible')) return;
  dragStartX = e.clientX;
  dragStartWidth = parseInt(getComputedStyle(appEl).getPropertyValue('--terminal-w')) || 420;
  appEl.classList.add('terminal-dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!appEl.classList.contains('terminal-dragging')) return;
  const delta = dragStartX - e.clientX;
  setTerminalWidth(clampTerminalWidth(dragStartWidth + delta));
});

document.addEventListener('mouseup', () => {
  if (!appEl.classList.contains('terminal-dragging')) return;
  appEl.classList.remove('terminal-dragging');
  fitTerminal();
});

window.addEventListener('resize', () => fitTerminal());

const savedTerminalWidth = parseInt(localStorage.getItem(TERMINAL_WIDTH_KEY) || '0');
if (savedTerminalWidth) appEl.style.setProperty('--terminal-w', `${clampTerminalWidth(savedTerminalWidth)}px`);

const splashEl = document.getElementById('splash');
const splashPickBtn = document.getElementById('splash-pick');
const splashRecentsEl = document.getElementById('splash-recents');

function shortenPath(p) {
  const home = '/Users/';
  if (p.startsWith(home)) {
    const rest = p.slice(home.length);
    const slash = rest.indexOf('/');
    if (slash > 0) return '~' + rest.slice(slash);
  }
  return p;
}

async function renderRecents() {
  const recents = await window.api.getRecentProjects();
  splashRecentsEl.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'splash-recents-title';
  title.textContent = 'Recent projects';
  splashRecentsEl.appendChild(title);

  if (recents.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'splash-recent-empty';
    empty.textContent = 'No recent projects yet.';
    splashRecentsEl.appendChild(empty);
    return;
  }
  for (const dir of recents) {
    const btn = document.createElement('button');
    btn.className = 'splash-recent-item';
    btn.textContent = shortenPath(dir);
    btn.title = dir;
    btn.addEventListener('click', () => switchProject(dir));
    splashRecentsEl.appendChild(btn);
  }
}

function teardownTerminal() {
  if (terminalId != null) {
    window.api.terminal.kill(terminalId);
    terminalId = null;
  }
  if (terminalDataUnsub) { terminalDataUnsub(); terminalDataUnsub = null; }
  if (terminalExitUnsub) { terminalExitUnsub(); terminalExitUnsub = null; }
  if (terminal) {
    try { terminal.dispose(); } catch {}
    terminal = null;
    terminalFit = null;
  }
  terminalHostEl.innerHTML = '';
}

async function switchProject(dir) {
  await flushSave();
  teardownTerminal();
  await clearEditor();
  try {
    await window.api.openProject(dir);
  } catch (e) {
    alert(`Could not open ${dir}\n\n${e.message || e}`);
    return;
  }
  activeProjectDir = dir;
  splashEl.classList.remove('visible');
  await loadFiles();
  if (localStorage.getItem(TERMINAL_VISIBLE_KEY) === '1') {
    setTerminalVisible(true);
  }
}

async function pickAndSwitch() {
  const picked = await window.api.pickProjectFolder();
  if (picked) await switchProject(picked);
}

splashPickBtn.addEventListener('click', pickAndSwitch);

window.api.onSwitchProject(switchProject);
window.api.onPickAndSwitch(pickAndSwitch);

updateModeButton();

(async () => {
  const current = await window.api.getCurrentProject();
  if (current) {
    activeProjectDir = current;
    splashEl.classList.remove('visible');
    await loadFiles();
    if (localStorage.getItem(TERMINAL_VISIBLE_KEY) === '1') {
      setTerminalVisible(true);
    }
  } else {
    await renderRecents();
  }
})();
