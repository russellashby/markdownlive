# Test 26 — Dragging multiple markdown files imports all of them

## Story

As a user, I want to import several markdown files at once so that I can bring an existing collection into the app in one step.

## Acceptance criteria

**Given** the app is open
**When** I drag multiple `.md` files onto the app window in a single drop
**Then** every dropped file is saved into `~/MarkdownNotes/`
**And** each appears in the sidebar
**And** the last imported file becomes the active note

## Manual verification

1. Create three markdown files outside the notes directory:
   ```sh
   for n in alpha beta gamma; do
     printf "# %s\n\nBody of %s.\n" "$n" "$n" > "/tmp/$n.md"
   done
   ```
2. Select all three in Finder (Cmd-click each).
3. Drag the selection onto the app window and release.
4. Confirm all three files exist in the notes directory:
   ```sh
   ls ~/MarkdownNotes/ | grep -E '^(alpha|beta|gamma)\.md$'
   ```
5. Confirm "alpha", "beta", and "gamma" all appear as separate entries in the sidebar.
6. Confirm one of them (the last imported) is the active note and the editor shows its content.
