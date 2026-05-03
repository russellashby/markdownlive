# Test 42 — Terminal pane is resizable and remembers width

## Story

As a user, I want to drag the divider between editor and terminal to give whichever pane I'm using more room, and have the app remember my choice for next time.

## Acceptance criteria

**Given** the terminal pane is open
**When** I hover over the divider between the editor and the terminal pane
**Then** the cursor changes to a resize cursor
**And** dragging left/right resizes the terminal pane between roughly 240 px and 900 px
**And** the resize is reflected in the terminal column count immediately (text reflows)
**And** the chosen width is remembered when I quit and relaunch the app

## Manual verification

1. Open the terminal pane (see Test 41).
2. Move the cursor over the thin vertical divider between the editor and the terminal pane. Confirm the cursor changes to a horizontal resize cursor.
3. Click and drag the divider to the left. Confirm:

   * The terminal pane widens; the editor narrows.

   * Terminal text reflows to use the extra width.
4. Drag the divider to the right until the pane reaches its minimum width (\~240 px). Confirm it stops shrinking.
5. Drag back to a width that fits a long command line.
6. Quit the app fully (Cmd+Q).
7. Relaunch the app and re-open the project from the splash.
8. Open the terminal pane.
9. Confirm it opens at the same width you left it at.

