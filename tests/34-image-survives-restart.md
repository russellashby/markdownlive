# Test 34 — Inserted images survive an app restart

## Story

As a user, I want images I added previously to keep rendering after I close and reopen the app so that my notes are durable, not session-only.

## Acceptance criteria

**Given** a note contains an image inserted via the editor
**When** I quit the app and relaunch it
**Then** opening the note again still shows the image rendered in the editor

## Manual verification

1. Complete Test 33 first so a note contains an inserted image.
2. Note the image you inserted is visible in the editor.
3. Quit the app fully (Cmd+Q).
4. Relaunch the app and re-open the same project from the splash.
5. Open the same note.
6. Confirm the image still renders in the editor (no broken-image icon).
7. Confirm the file is still present on disk:
   ```sh
   ls "$PROJECT"/.markdownlive/images/
   ```
