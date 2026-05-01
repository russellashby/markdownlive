# Test 43 — External edits to the open note refresh the editor live

## Story

As a user, I want files edited by the terminal (or any external tool) to update in the editor immediately so that the live view never lies about what's on disk.

## Acceptance criteria

**Given** a note is open in the editor and I am not currently typing
**When** the file is changed by another process (e.g. `sed`, `echo >>`, or Claude CLI in the terminal pane)
**Then** the editor's content updates within ~1 second to reflect the new file contents
**And** the sidebar reflects any rename / add / remove that happened
**And** if I have unsaved local edits, my typing is preserved (the external change is not applied until I move on)

## Manual verification

1. Create or open a note called "scratch".
2. Confirm the status bar shows **Saved** and you are not actively typing.
3. Open the terminal pane (see Test 41) and from the prompt run:
   ```sh
   printf '\n\nAdded from the terminal at %s\n' "$(date)" >> ~/MarkdownNotes/scratch.md
   ```
   (Or ask Claude in the terminal to add a line to the same note.)
4. Within ~1 second, confirm the new line appears in the editor without you having to switch notes.
5. **Local-edits guard:** start typing a long line in the editor. Before pausing, run the same `printf` command from the terminal again.
6. Confirm:
   - Your typed text is still present in the editor (not clobbered).
   - When you stop typing for ~2 seconds, the autosave fires and your version is what ends up on disk (the terminal append is overwritten — acceptable for now).
