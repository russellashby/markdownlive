# Test 04 — Active note is highlighted in sidebar

## Story

As a user, I want a clear visual cue showing which note I am currently editing so that I do not get confused when switching between similarly named notes.

## Acceptance criteria

**Given** the sidebar lists multiple notes
**When** a note is open in the editor
**Then** that note's row in the sidebar shows the active style (lighter background, white text, blue left border)
**And** no other row carries the active style at the same time

## Manual verification

1. Open the app with at least three notes in the sidebar.
2. Confirm exactly one row has the highlighted background and the blue left border accent.
3. Click each note in turn. Confirm the highlight follows the selection and only one row is highlighted at any time.
