# Test suite

Manual acceptance tests for the markdown editor. Each file describes one scenario in Given/When/Then form with concrete verification steps.

Run order is independent — tests can be executed in any sequence, but a fresh empty project folder is recommended for any test marked **Requires clean state**.

## Conventions

* The app no longer hardcodes a notes directory. Each launch shows a splash where you pick a project folder; tests assume you've picked one before they begin.
* Shell snippets reference the chosen folder via `"$PROJECT"`. Set it once per test session:

  ```sh
  export PROJECT="/path/to/your/open/folder"
  ```

## How to reset state

```sh
# Quit the app first, then either:
rm -rf "$PROJECT"          # wipe the open project
# or open a different empty folder via File → Open Folder…

# To simulate a true first launch (no recent projects on disk):
rm -f ~/Library/Application\ Support/MarkdownLive/recent-projects.json
```

## Index

### File management

* [01 — First launch shows the project picker splash](01-first-launch-shows-splash.md)

* [02 — Sidebar shows recent notes first](02-sidebar-shows-recent-notes-first.md)

* [03 — Clicking a note loads its content](03-clicking-note-loads-content.md)

* [04 — Active note is highlighted in sidebar](04-active-note-highlighted.md)

* [05 — New-note button creates an empty note](05-new-note-button-creates-empty-note.md)

* [06 — Cmd+N creates a new note](06-cmd-n-creates-new-note.md)

* [07 — Editing the title renames the file on disk](07-title-edit-renames-file.md)

* [08 — Delete removes the note after confirmation](08-delete-note-with-confirmation.md)

* [09 — Duplicate filenames are disambiguated](09-duplicate-filename-disambiguated.md)

* [10 — Invalid filename characters are stripped](10-invalid-filename-chars-stripped.md)

* [11 — Files persist as plain markdown](11-files-persist-as-plain-markdown.md)

### Editor

* [12 — Markdown syntax renders live as you type](12-markdown-renders-live.md)

* [13 — Tables render with grid lines](13-tables-render-with-grid-lines.md)

* [14 — Word count updates live](14-word-count-updates-live.md)

* [15 — Content width scales with window size](15-content-width-scales-with-window.md)

### Save behaviour

* [16 — Autosave debounces typing](16-autosave-debounces-typing.md)

* [17 — Save status reflects current state](17-save-status-reflects-state.md)

* [18 — No-op events skip disk write](18-noop-events-skip-disk-write.md)

* [19 — Window blur flushes pending save](19-window-blur-flushes-save.md)

* [20 — Cmd+S flushes save immediately](20-cmd-s-flushes-save.md)

### macOS integration

* [21 — Spell check underlines misspelled words](21-spell-check-underlines-misspellings.md)

* [22 — Right-click shows spelling suggestions](22-right-click-shows-suggestions.md)

* [23 — Add to Dictionary persists across sessions](23-add-word-to-dictionary.md)

* [24 — Edit menu exposes macOS substitutions](24-edit-menu-substitutions.md)

### Import

* [25 — Drag and drop imports a markdown file](25-drag-drop-imports-markdown-file.md)

* [26 — Dragging multiple markdown files imports all of them](26-drag-drop-multiple-files.md)

* [27 — Importing a duplicate filename is disambiguated](27-drag-drop-duplicate-filename.md)

### Sync with disk

* [28 — Externally added file appears in the sidebar](28-external-add-refreshes-sidebar.md)

* [29 — Externally deleted file disappears from the sidebar](29-external-delete-refreshes-sidebar.md)

### Folder grouping

* [30 — Sidebar groups notes by folder](30-sidebar-groups-by-folder.md)

* [31 — Folders expand and collapse on click](31-folder-expand-collapse.md)

* [32 — Collapsed-folder state persists across restarts](32-folder-collapsed-state-persists.md)

### Images

* [33 — Inserting an image saves the file to disk](33-image-upload-saves-to-disk.md)

* [34 — Inserted images survive an app restart](34-image-survives-restart.md)

### Raw markdown mode

* [35 — Toggle between raw and live editing modes](35-toggle-raw-and-live-mode.md)

* [36 — Raw mode autosaves typed changes](36-raw-mode-autosaves.md)

* [37 — Editor mode persists across restarts and notes](37-mode-persists-across-restart.md)

### Sidebar collapse

* [38 — Sidebar collapses to give the editor full width](38-sidebar-collapses.md)

* [39 — Expand icon restores the sidebar](39-sidebar-re-expands.md)

* [40 — Sidebar collapsed state persists across restarts](40-sidebar-state-persists.md)

### Terminal pane

* [41 — Terminal toggle opens an interactive shell](41-terminal-toggle-and-shell.md)

* [42 — Terminal pane is resizable and remembers width](42-terminal-resize-and-persist.md)

* [43 — External edits to the open note refresh the editor live](43-terminal-edits-refresh-editor.md)

### Project folder

* [44 — File menu provides Open Folder and Open Recent](44-file-menu-open-folder.md)

* [45 — Switching projects clears editor state and re-targets the terminal](45-project-switching-clears-state.md)

* [46 — Sidebar shows nested folders recursively](46-sidebar-shows-nested-folders.md)

