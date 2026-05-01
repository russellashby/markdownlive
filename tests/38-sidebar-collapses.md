# Test 38 — Sidebar collapses to give the editor full width

## Story

As a user, I want to collapse the notes panel so that I can give the editor the entire window width when I'm focused on writing.

## Acceptance criteria

**Given** the app is open with the sidebar visible (default)
**When** I click the collapse icon at the bottom-left of the sidebar
**Then** the sidebar slides away to zero width
**And** the editor now occupies the full window width
**And** an expand icon appears in the editor pane header to bring the sidebar back

## Manual verification

1. Open the app. Confirm the sidebar is visible by default with the file list and the **+** button.
2. Locate the collapse icon — a small `‹` button at the bottom-left of the sidebar.
3. Click it.
4. Confirm:
   - The sidebar animates closed (~150ms).
   - The editor pane fills the full window width.
   - A small `›` (expand) button appears at the top-left of the editor pane header, before the title field.
5. Type into the editor and confirm typing/saving still works exactly as before.
