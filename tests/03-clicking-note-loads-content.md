# Test 03 — Clicking a note loads its content

## Story

As a user, I want to click any note in the sidebar to open it in the editor so that I can switch between notes quickly.

## Acceptance criteria

**Given** the sidebar lists at least two notes
**And** one of them is currently open in the editor
**When** I click a different note in the sidebar
**Then** any pending unsaved changes in the current note are flushed to disk
**And** the clicked note's content replaces the editor content
**And** the title field updates to the clicked note's name
**And** the sidebar highlight moves to the clicked item

## Manual verification

1. Have two notes (e.g. **Alpha** and **Bravo**) with distinct content.
2. Open **Alpha**. Type "edit-marker" into the body. Wait 2 seconds.
3. Click **Bravo** in the sidebar.
4. Confirm the editor now shows Bravo's content.
5. Confirm the title field reads "Bravo".
6. Click **Alpha** again — confirm "edit-marker" is still present (saved before the switch).
7. Inspect `"$PROJECT"/Alpha.md` on disk and confirm "edit-marker" is in the file.
