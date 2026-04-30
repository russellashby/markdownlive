# Test 08 — Delete removes the note after confirmation

## Story

As a user, I want a confirmation step before deleting a note so that I do not lose work to a misclick.

## Acceptance criteria

**Given** a note is open in the editor
**When** I click the **Delete** button in the editor header
**Then** a native confirmation dialog appears showing the note's filename
**And** choosing **Cancel** keeps the file and the editor state unchanged
**And** choosing **Delete** removes the file from `~/MarkdownNotes/`
**And** the sidebar refreshes to remove the entry
**And** the next most-recent note opens automatically (if any remain)

## Manual verification

1. Create a note **ToDelete** with some content.
2. Click **Delete**.
3. In the confirmation dialog, click **Cancel**. Confirm the file still exists and the editor still shows the note.
4. Click **Delete** again, then choose **Delete** in the dialog.
5. Confirm `~/MarkdownNotes/ToDelete.md` no longer exists.
6. Confirm the sidebar no longer lists "ToDelete".
7. Confirm a different note has opened in the editor (or the editor is empty if no other notes exist).
