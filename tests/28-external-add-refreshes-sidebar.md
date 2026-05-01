# Test 28 — Externally added file appears in the sidebar

## Story

As a user, I want files I drop into `~/MarkdownNotes/` from outside the app (Finder, terminal, another tool) to show up immediately so that I never have to restart to see them.

## Acceptance criteria

**Given** the app is open
**When** a new `.md` file is created in `~/MarkdownNotes/` from outside the app
**Then** the new file appears in the sidebar within ~1 second
**And** I do not need to restart or reload the window

## Manual verification

1. With the app open, count the entries in the sidebar.
2. From a separate terminal window, create a new note directly in the notes directory:
   ```sh
   printf '# External\n\nCreated outside the app.\n' > ~/MarkdownNotes/external-note.md
   ```
3. Without touching the app, watch the sidebar. Within ~1 second, "external-note" appears as a new entry.
4. Click it and confirm the editor loads the content "Created outside the app."
5. Repeat with a copy via Finder (drag a `.md` file from elsewhere into the `~/MarkdownNotes/` folder using Finder, not the app window) and confirm the same behaviour.
