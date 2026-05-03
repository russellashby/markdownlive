# Test 07 — Editing the title renames the file on disk

## Story

As a user, I want to rename a note simply by editing its title so that I do not need a separate dialog or menu.

## Acceptance criteria

**Given** a note is open in the editor
**When** I change the text in the title field
**And** I stop typing for ~500 ms
**Then** the underlying file in `"$PROJECT"/` is renamed to match the new title
**And** the sidebar updates to show the new name in the same position
**And** an empty title is treated as `Untitled`

## Manual verification

1. Create a note titled **Draft One**.
2. Confirm `"$PROJECT"/Draft One.md` exists.
3. Click into the title field and change it to **Final**.
4. Wait one second.
5. Confirm `"$PROJECT"/Final.md` exists and `Draft One.md` no longer exists.
6. Confirm the sidebar shows "Final" in place of "Draft One".
7. Clear the title field entirely. Confirm the file becomes `Untitled.md` (or similar) on disk.
