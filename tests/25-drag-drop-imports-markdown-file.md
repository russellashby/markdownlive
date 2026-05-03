# Test 25 — Drag and drop imports a markdown file

## Story

As a user, I want to drag a markdown file from Finder into the app so that it becomes part of my notes without manual copying.

## Acceptance criteria

**Given** the app is open
**When** I drag a `.md` file from Finder onto the app window and release
**Then** a copy of that file is saved into `"$PROJECT"/`
**And** it appears in the sidebar immediately
**And** it becomes the active note with its contents shown in the editor

## Manual verification

1. Create a markdown file outside the notes directory:
   ```sh
   printf '# Imported note\n\nHello from Finder.\n' > /tmp/imported-note.md
   ```
2. Open Finder at `/tmp/` and locate `imported-note.md`.
3. Drag the file from Finder onto the app window (anywhere — sidebar or editor area) and release.
4. Confirm `"$PROJECT"/imported-note.md` now exists:
   ```sh
   ls "$PROJECT"/ | grep imported-note
   ```
5. Confirm "imported-note" appears in the sidebar without needing to restart or refresh.
6. Confirm it is the active (highlighted) note and the editor shows the heading "Imported note" and the body text.
