# Test 16 — Autosave debounces typing

## Story

As a user, I want changes saved automatically without thrashing the disk on every keystroke so that the app feels responsive and does not hammer the filesystem.

## Acceptance criteria

**Given** I am typing into a note
**When** I make consecutive keystrokes faster than the debounce window
**Then** no disk write occurs while typing is ongoing
**And** a single disk write occurs ~1.5 seconds after the last keystroke
**And** the file's modification time on disk reflects that single write, not one per keystroke

## Manual verification

1. Open any note. In a terminal, run:
   ```sh
   stat -f "%Sm" "~/MarkdownNotes/<name>.md"
   ```
   Note the mtime.
2. Switch to the editor and type a paragraph rapidly without pausing for more than a second.
3. Re-run `stat` while still typing — confirm the mtime has *not* yet changed.
4. Stop typing. Wait 2 seconds.
5. Re-run `stat` — confirm the mtime has now updated exactly once, not many times.
6. Repeat with a second pause mid-paragraph: confirm exactly two mtime updates total (one per pause).
