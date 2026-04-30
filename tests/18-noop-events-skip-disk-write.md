# Test 18 — No-op events skip disk write

## Story

As a user, I want the app to avoid writing to disk when nothing has actually changed so that file modification times stay meaningful and external sync tools (iCloud, Git, Obsidian) do not see phantom updates.

## Acceptance criteria

**Given** a note is open and currently in the **Saved** state
**When** the editor fires a content-update event whose markdown is identical to the last saved content (e.g. cursor or selection movement)
**Then** no disk write occurs
**And** the status bar remains on **Saved**
**And** the file's modification time on disk does not change

## Manual verification

1. Open a note. Confirm status is **Saved**.
2. Note the file's mtime: `stat -f "%Sm %Sm" "~/MarkdownNotes/<name>.md"`.
3. Click around in the editor body. Move the cursor with arrow keys. Select and deselect text.
4. Wait 3 seconds.
5. Re-check the mtime — confirm it has not changed.
6. Confirm the status bar never showed **Unsaved** during step 3.
