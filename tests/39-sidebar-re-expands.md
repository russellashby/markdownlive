# Test 39 — Expand icon restores the sidebar

## Story

As a user, I want a clear way to bring the sidebar back after collapsing it so that I can return to navigating notes.

## Acceptance criteria

**Given** the sidebar is collapsed
**When** I click the expand icon in the editor pane header
**Then** the sidebar slides back to its original width
**And** the file list, **+** button, and collapse icon are visible again
**And** the expand icon disappears from the editor pane header

## Manual verification

1. Start with the sidebar collapsed (see Test 38 if needed).
2. Click the `›` expand button at the top-left of the editor pane header.
3. Confirm:
   - The sidebar animates back to its original width.
   - The file list and **+** button reappear.
   - The collapse icon `‹` is visible again at the bottom-left of the sidebar.
   - The expand icon `›` is no longer present in the editor pane header.
4. Click a different note in the sidebar and confirm normal navigation works.
