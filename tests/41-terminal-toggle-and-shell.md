# Test 41 — Terminal toggle opens an interactive shell

## Story

As a user, I want a button (and a shortcut) that opens an interactive terminal inside the app so that I can run command-line tools next to my notes without leaving the window.

## Acceptance criteria

**Given** the app is open with no terminal visible
**When** I click the **Terminal** button in the pane header (or press Cmd+`)
**Then** a terminal pane opens on the right-hand side of the window
**And** the terminal runs my default shell with `cwd` set to the open project folder
**And** the **Terminal** button shows an active visual state
**And** clicking the button (or pressing Cmd+`) again closes the pane
**And** typing into the terminal renders text at the correct width on first open (no squashed columns)

## Manual verification

1. Open the app. Confirm no terminal is visible to the right of the editor.
2. Click **Terminal** in the pane header (or press Cmd+`).
3. Confirm:
   - A right-hand pane appears containing a shell prompt.
   - Text in the terminal renders at a sensible width (a few words per line, not 1–3 chars).
   - The **Terminal** button is highlighted.
4. In the terminal, type `pwd` and press Enter.
5. Confirm the output matches the project folder you opened in the splash.
6. Type `echo $SHELL` and confirm it shows the same path as `echo $SHELL` in your normal terminal.
7. Press Cmd+`. Confirm the terminal pane disappears and the **Terminal** button is no longer highlighted.
8. Press Cmd+` again. Confirm the same shell session is still there with your previous commands in scrollback.
