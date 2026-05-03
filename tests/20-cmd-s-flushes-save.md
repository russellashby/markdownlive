# Test 20 — Cmd+S flushes save immediately

## Story

As a user with muscle memory from other editors, I want **Cmd+S** to commit my pending changes immediately so that I can save on demand without waiting for the autosave timer.

## Acceptance criteria

**Given** the status bar shows **Unsaved** (a debounce timer is pending)
**When** I press **Cmd+S**
**Then** the pending write fires immediately
**And** the status bar transitions through **Saving…** to **Saved**
**And** Cmd+S does not trigger a browser "Save Page As" dialog

## Manual verification

1. Open a note.
2. Type a few characters and *immediately* press **Cmd+S** (well before the 1.5s debounce).
3. Confirm the status bar transitions to **Saved** within a fraction of a second.
4. Confirm no system "save dialog" appears.
5. Inspect the file on disk and confirm the new content is present.

