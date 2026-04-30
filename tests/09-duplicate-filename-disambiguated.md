# Test 09 — Duplicate filenames are disambiguated

## Story

As a user, I want to create multiple "Untitled" notes without one overwriting another so that rapid capture is safe.

## Acceptance criteria

**Given** `~/MarkdownNotes/Untitled.md` already exists
**When** I create a new note via **+** or Cmd+N
**Then** the new file is saved as `Untitled 1.md`
**And** if `Untitled 1.md` also exists it becomes `Untitled 2.md`, and so on

## Manual verification

1. Click **+** to create a new note. Leave the title as "Untitled".
2. Click **+** twice more without changing titles.
3. Inspect `~/MarkdownNotes/`:
   ```sh
   ls ~/MarkdownNotes/ | grep -i untitled
   ```
4. Confirm the directory contains `Untitled.md`, `Untitled 1.md`, and `Untitled 2.md`.
5. Confirm each appears as a separate entry in the sidebar.
