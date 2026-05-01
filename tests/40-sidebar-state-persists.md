# Test 40 — Sidebar collapsed state persists across restarts

## Story

As a user, I want the app to remember whether I last left the sidebar collapsed or expanded so that I don't have to re-toggle it every session.

## Acceptance criteria

**Given** I have collapsed the sidebar
**When** I quit the app and relaunch it
**Then** the sidebar is still collapsed
**And** if I expand it and relaunch again, the sidebar opens expanded

## Manual verification

1. Open the app. Confirm the sidebar is expanded by default on a fresh install (no `mdedit.sidebarCollapsed` localStorage key).
2. Click the collapse icon `‹` to hide the sidebar.
3. Quit the app fully (Cmd+Q).
4. Relaunch the app.
5. Confirm:
   - The sidebar is still collapsed at launch.
   - The expand icon `›` is visible in the editor pane header.
6. Click `›` to expand the sidebar.
7. Quit and relaunch once more.
8. Confirm the sidebar is now expanded at launch.
