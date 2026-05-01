# Test 36 — Raw mode autosaves typed changes

## Story

As a user, I want raw-mode edits to autosave just like live-mode edits so that I never lose work regardless of which view I'm using.

## Acceptance criteria

**Given** I am editing a note in raw mode
**When** I stop typing for the autosave debounce window (~1.5s)
**Then** the file on disk is updated with my exact raw markdown
**And** the status bar shows "Saved"
**And** Cmd+S forces an immediate save just like in live mode

## Manual verification

1. Open a note and switch to raw mode (see Test 35).
2. Confirm the status bar reads "Saved".
3. Type some new content in the textarea — for example append a line `Edited in raw mode.`
4. Confirm the status bar transitions to "Unsaved" then "Saving…" and finally "Saved" within ~2 seconds.
5. Verify on disk the change is present:
   ```sh
   tail -n 3 ~/MarkdownNotes/<your-note>.md
   ```
   The new line should appear verbatim.
6. Type another change. Before the debounce fires, press **Cmd+S**.
7. Confirm the status bar jumps straight to "Saved" and the change is on disk immediately.
