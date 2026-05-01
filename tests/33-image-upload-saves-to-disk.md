# Test 33 — Inserting an image saves the file to disk

## Story

As a user, I want images I add via the editor UI to be saved into my notes directory so that the markdown file references a real, persistent file on disk rather than a temporary in-memory blob.

## Acceptance criteria

**Given** I have a note open
**When** I add an image using the editor's upload UI (slash command "/image" or the inline image picker, then choose a file)
**Then** the image file is copied into `~/MarkdownNotes/images/`
**And** the markdown source contains a relative reference like `images/<filename>` (not a `blob:` URL)
**And** the image renders in the editor

## Manual verification

1. Make sure no `images/` folder exists yet, to keep this test clean:
   ```sh
   rm -rf ~/MarkdownNotes/images
   ```
2. In the app, open or create a note.
3. In the editor, type `/image` on a new line and pick the **Image** slash-command result.
4. Click **Upload file**, choose any `.png` or `.jpg` from disk, and confirm.
5. Confirm the image appears inline in the editor.
6. Verify the file landed on disk:
   ```sh
   ls ~/MarkdownNotes/images/
   ```
   The chosen image (sanitised name) should be there.
7. Open the note's markdown source from a terminal:
   ```sh
   cat ~/MarkdownNotes/<your-note>.md
   ```
   The image line should reference the relative path (e.g. `![](images/my-photo.png)` — not `blob:`, not `data:`, not `file://`).
