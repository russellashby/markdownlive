# Test 37 — Editor mode persists across restarts and notes

## Story

As a user, I want the editor to remember whether I last used live or raw mode so that my preference applies globally across notes and across app restarts.

## Acceptance criteria

**Given** I have set the editor to raw mode
**When** I switch between notes
**Then** every note opens in raw mode
**And** when I quit the app and relaunch it, raw mode is still active
**And** switching back to live mode and relaunching brings the app back to live mode

## Manual verification

1. Open the app. Confirm the editor is in live mode by default on a fresh install (no `mdedit.mode` localStorage key).
2. Click **Raw** to switch.
3. Click another note in the sidebar. Confirm it also opens in raw mode (textarea, not WYSIWYG).
4. Quit the app fully (Cmd+Q).
5. Relaunch the app and re-open the project from the splash.
6. Confirm:
   - The currently active note opens in raw mode.
   - The **Raw** button is highlighted.
7. Click **Raw** again to return to live mode.
8. Quit and relaunch once more, re-opening the project from the splash.
9. Confirm the app is back in live mode (Crepe WYSIWYG, **Raw** button not highlighted).
