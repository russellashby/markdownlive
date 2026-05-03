# Test 32 — Collapsed-folder state persists across restarts

## Story

As a user, I want the app to remember which folders I've collapsed so that I don't have to re-collapse them every time I open the app.

## Acceptance criteria

**Given** I have collapsed one or more folders in the sidebar
**When** I quit the app and relaunch it
**Then** those folders are still collapsed
**And** folders I left expanded are still expanded

## Manual verification

1. Ensure at least two folders with notes exist (see Test 30 for setup).
2. Start the app. Both folders should be expanded by default.
3. Click one folder header to collapse it. Leave the other expanded.
4. Quit the app fully (Cmd+Q).
5. Relaunch the app and re-open the project from the splash.
6. Confirm:
   - The folder you collapsed is still collapsed (chevron rotated, notes hidden).
   - The folder you left expanded is still expanded.
7. Click the collapsed folder to re-expand it.
8. Quit and relaunch once more, re-opening the project from the splash.
9. Confirm both folders are now expanded — the change has been remembered.
