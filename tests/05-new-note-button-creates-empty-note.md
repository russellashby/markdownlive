# Test 05 — New-note button creates an empty note

## Story

As a user, I want a one-click action to start a new note so that I can capture a thought quickly.

## Acceptance criteria

**Given** the app is open
**When** I click the **+** button in the sidebar header
**Then** a new file `Untitled.md` is created in `"$PROJECT"/`
**And** the new note appears at the top of the sidebar
**And** it becomes the active note
**And** the editor body is empty
**And** focus moves to the title field with the existing text selected

## Manual verification

1. Note the count of files in `"$PROJECT"/` (e.g. `ls "$PROJECT"/ | wc -l`).
2. Click the **+** button in the sidebar header.
3. Confirm `"$PROJECT"/Untitled.md` now exists (or `Untitled 1.md` etc. if "Untitled" was already taken).
4. Confirm the sidebar's top entry is the newly created note and is highlighted.
5. Confirm the editor body is empty.
6. Confirm the title field has focus and "Untitled" is fully selected (typing immediately replaces it).
