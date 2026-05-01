# Test 31 — Folders expand and collapse on click

## Story

As a user, I want to collapse folders I'm not currently working in so that the sidebar stays focused on my active topic.

## Acceptance criteria

**Given** the sidebar shows at least one folder header with notes inside
**When** I click a folder header
**Then** the folder's notes hide and the chevron rotates to indicate the collapsed state
**And** clicking the header again expands it and reveals the notes again

## Manual verification

1. Ensure at least one folder with notes exists (see Test 30 for setup).
2. Confirm the folder is expanded by default — its notes are visible and the chevron points down (▾).
3. Click the folder header.
4. Confirm:
   - The notes inside are no longer visible.
   - The chevron has rotated (now pointing right).
5. Click the header again.
6. Confirm the notes are visible again and the chevron points down.
7. Repeat with a second folder to confirm folders collapse independently.
