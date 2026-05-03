# Test 29 — Externally deleted file disappears from the sidebar

## Story

As a user, I want notes I delete from `"$PROJECT"/` outside the app to disappear from the sidebar so that the panel always reflects what's actually on disk.

## Acceptance criteria

**Given** the app is open and a note "scratch" exists in the sidebar
**When** the underlying `"$PROJECT"/scratch.md` is deleted from outside the app
**Then** the "scratch" entry disappears from the sidebar within ~1 second
**And** if "scratch" was the active note, the editor switches to another note (or clears if none remain)

## Manual verification

1. Ensure a "scratch" note exists; create one if needed:
   ```sh
   printf '# Scratch\n' > "$PROJECT"/scratch.md
   ```
2. Confirm "scratch" appears in the sidebar (it should — see Test 28).
3. Click "scratch" so it is the active note.
4. From a separate terminal, delete the file:
   ```sh
   rm "$PROJECT"/scratch.md
   ```
5. Within ~1 second, the "scratch" entry disappears from the sidebar.
6. The editor switches to the next available note (or shows an empty editor if no notes remain).
