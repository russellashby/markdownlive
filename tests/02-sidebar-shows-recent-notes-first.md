# Test 02 — Sidebar shows recent notes first

## Story

As a returning user, I want my most-recently edited note at the top of the sidebar so that I can pick up where I left off without scrolling.

## Acceptance criteria

**Given** `"$PROJECT"/` contains multiple `.md` files with different modification times
**When** I launch the app
**Then** the sidebar lists notes ordered by modification time (most recent first)
**And** the modification time on disk drives the ordering, not filename alphabetical

## Manual verification

1. Quit the app.
2. Create three test files, each touched at different times:
   ```sh
   touch -t 202601010900 "$PROJECT"/Alpha.md
   touch -t 202601020900 "$PROJECT"/Bravo.md
   touch -t 202601030900 "$PROJECT"/Charlie.md
   ```
3. Launch the app and re-open the project from the splash.
4. Confirm sidebar order top-to-bottom is: **Charlie**, **Bravo**, **Alpha**.
5. Edit Alpha (type any character). Wait 2 seconds for autosave.
6. Confirm Alpha moves to the top of the sidebar after the next refresh (e.g. after a rename or new note action).
