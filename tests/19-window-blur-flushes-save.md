# Test 19 — Window blur flushes pending save

## Story

As a user, I want pending changes to commit immediately when I switch to another app so that my work is durable even if the editor crashes while in the background.

## Acceptance criteria

**Given** I have just finished typing and the status reads **Unsaved** (debounce timer pending)
**When** I switch focus away from the app window (Cmd+Tab, click another app, etc.)
**Then** the pending write is flushed immediately, before the debounce timer would have fired
**And** the file on disk reflects the latest content
**And** the status bar shows **Saved** when I return to the window

## Manual verification

1. Open a note.
2. Type a unique phrase like `blur-marker-12345` and *immediately* press **Cmd+Tab** to another app.
3. Within ~200ms (well below the 1.5s debounce), inspect the file on disk:
   ```sh
   grep "blur-marker-12345" ~/MarkdownNotes/<name>.md
   ```
4. Confirm the marker is already on disk — the blur-flush ran before the debounce timer.
5. Switch back to the editor. Confirm the status bar reads **Saved**.
