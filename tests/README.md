# Test suite

Manual acceptance tests for the markdown editor. Each file describes one scenario in Given/When/Then form with concrete verification steps.

Run order is independent — tests can be executed in any sequence, but a fresh `~/MarkdownNotes/` directory is recommended for any test marked **Requires clean state**.

## How to reset state

```sh
# Quit the app first, then:
rm -rf ~/MarkdownNotes
```

The next launch will recreate the directory and seed the welcome note.

## Index

### File management
- [01 — First launch seeds welcome note](01-first-launch-seeds-welcome-note.md)
- [02 — Sidebar shows recent notes first](02-sidebar-shows-recent-notes-first.md)
- [03 — Clicking a note loads its content](03-clicking-note-loads-content.md)
- [04 — Active note is highlighted in sidebar](04-active-note-highlighted.md)
- [05 — New-note button creates an empty note](05-new-note-button-creates-empty-note.md)
- [06 — Cmd+N creates a new note](06-cmd-n-creates-new-note.md)
- [07 — Editing the title renames the file on disk](07-title-edit-renames-file.md)
- [08 — Delete removes the note after confirmation](08-delete-note-with-confirmation.md)
- [09 — Duplicate filenames are disambiguated](09-duplicate-filename-disambiguated.md)
- [10 — Invalid filename characters are stripped](10-invalid-filename-chars-stripped.md)
- [11 — Files persist as plain markdown](11-files-persist-as-plain-markdown.md)

### Editor
- [12 — Markdown syntax renders live as you type](12-markdown-renders-live.md)
- [13 — Tables render with grid lines](13-tables-render-with-grid-lines.md)
- [14 — Word count updates live](14-word-count-updates-live.md)
- [15 — Content width scales with window size](15-content-width-scales-with-window.md)

### Save behaviour
- [16 — Autosave debounces typing](16-autosave-debounces-typing.md)
- [17 — Save status reflects current state](17-save-status-reflects-state.md)
- [18 — No-op events skip disk write](18-noop-events-skip-disk-write.md)
- [19 — Window blur flushes pending save](19-window-blur-flushes-save.md)
- [20 — Cmd+S flushes save immediately](20-cmd-s-flushes-save.md)

### macOS integration
- [21 — Spell check underlines misspelled words](21-spell-check-underlines-misspellings.md)
- [22 — Right-click shows spelling suggestions](22-right-click-shows-suggestions.md)
- [23 — Add to Dictionary persists across sessions](23-add-word-to-dictionary.md)
- [24 — Edit menu exposes macOS substitutions](24-edit-menu-substitutions.md)

### Import
- [25 — Drag and drop imports a markdown file](25-drag-drop-imports-markdown-file.md)
- [26 — Dragging multiple markdown files imports all of them](26-drag-drop-multiple-files.md)
- [27 — Importing a duplicate filename is disambiguated](27-drag-drop-duplicate-filename.md)
