# Test 06 — Cmd+N creates a new note

## Story

As a power user, I want a keyboard shortcut to create a note so that I do not have to reach for the mouse.

## Acceptance criteria

**Given** the app window has focus
**When** I press **Cmd+N**
**Then** the same flow as clicking the **+** button runs
**And** a new untitled note is created, opened, and the title field is focused

## Manual verification

1. Click anywhere in the editor body (so focus is in the document, not the title field).
2. Press **Cmd+N**.
3. Confirm a new note is created at the top of the sidebar.
4. Confirm focus has moved to the title field with "Untitled" selected.
5. Repeat with focus in the sidebar — same outcome expected.
6. Confirm pressing Cmd+N does not type the letter "n" into the editor body.
