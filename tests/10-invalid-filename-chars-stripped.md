# Test 10 — Invalid filename characters are stripped

## Story

As a user, I want to type any title I want without worrying about producing a corrupt filename so that the app handles sanitisation transparently.

## Acceptance criteria

**Given** a note is open
**When** I edit the title to contain characters that are illegal in filenames (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`)
**Then** those characters are stripped before the file is renamed on disk
**And** the resulting filename is valid on macOS
**And** if the sanitised name would be empty, it is replaced with `Untitled`

## Manual verification

1. Open any note.
2. Set the title to `Notes / Drafts: 2026?`.
3. Wait one second for the rename to apply.
4. Inspect `"$PROJECT"/`. Confirm a file like `Notes  Drafts 2026.md` exists (illegal characters removed; spaces preserved).
5. Set the title to `:::` (only illegal characters).
6. Confirm the file becomes `Untitled.md` (or `Untitled N.md` if collision).
