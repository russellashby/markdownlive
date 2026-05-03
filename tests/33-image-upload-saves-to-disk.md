# Test 33 — Inserting an image saves the file to disk

## Story

As a user, I want images I add via the editor UI to be saved into my project's metadata folder so that the markdown file references a real, persistent file on disk rather than a temporary in-memory blob.

## Acceptance criteria

**Given** I have a note open
**When** I add an image using the editor's upload UI (slash command "/image" or the inline image picker, then choose a file)
**Then** the image file is copied into `<project>/.markdownlive/images/`
**And** the markdown source contains a relative reference like `.markdownlive/images/<filename>` (not a `blob:` URL)
**And** the image renders in the editor

## Manual verification

1. With a project open via the splash, set `PROJECT` so the shell snippets below work:
   ```sh
   export PROJECT="/path/to/your/open/folder"
   ```
2. To keep this test clean, remove any previous image cache:
   ```sh
   rm -rf "$PROJECT"/.markdownlive/images
   ```
3. In the app, open or create a note.
4. In the editor, type `/image` on a new line and pick the **Image** slash-command result.
5. Click **Upload file**, choose any `.png` or `.jpg` from disk, and confirm.
6. Confirm the image appears inline in the editor.
7. Verify the file landed on disk:
   ```sh
   ls "$PROJECT"/.markdownlive/images/
   ```
   The chosen image (sanitised name) should be there.
8. Open the note's markdown source from a terminal:
   ```sh
   cat "$PROJECT"/<your-note>.md
   ```
   The image line should reference the relative path (e.g. `![](.markdownlive/images/my-photo.png)` — not `blob:`, not `data:`, not `file://`).
