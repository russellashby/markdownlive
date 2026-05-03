# Test 27 — Importing a duplicate filename is disambiguated

## Story

As a user, I want dropped files to never overwrite an existing note so that I can import safely without checking names first.

## Acceptance criteria

**Given** `"$PROJECT"/notes.md` already exists with content "original"
**When** I drag a different file also named `notes.md` onto the window
**Then** the imported file is saved as `notes 1.md`
**And** the existing `notes.md` is unchanged
**And** subsequent imports of the same name become `notes 2.md`, `notes 3.md`, and so on

## Manual verification

1. Make sure a `notes.md` already exists in the notes directory:
   ```sh
   printf '# Original\n' > "$PROJECT"/notes.md
   ```
2. Create a different file with the same basename outside the notes directory:
   ```sh
   printf '# Imported version\n' > /tmp/notes.md
   ```
3. Drag `/tmp/notes.md` onto the app window.
4. Confirm both files exist:
   ```sh
   ls "$PROJECT"/ | grep -E '^notes( 1)?\.md$'
   ```
5. Confirm `"$PROJECT"/notes.md` still contains "Original" (`cat "$PROJECT"/notes.md`).
6. Confirm `"$PROJECT"/notes 1.md` contains "Imported version".
7. Drag `/tmp/notes.md` onto the window a second time and confirm `notes 2.md` is created.
