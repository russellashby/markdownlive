# Test 01 — First launch seeds welcome note

**Requires clean state.**

## Story

As a first-time user, I want the app to give me something to read on launch so that I am not staring at an empty interface.

## Acceptance criteria

**Given** `~/MarkdownNotes/` does not exist
**When** I launch the app for the first time
**Then** `~/MarkdownNotes/` is created
**And** a file named `Getting Started.md` is placed inside it
**And** the sidebar lists "Getting Started" as the only note
**And** that note opens automatically in the editor

## Manual verification

1. Quit the app if it is running.
2. `rm -rf ~/MarkdownNotes`
3. `npm start`
4. Confirm in Finder/terminal that `~/MarkdownNotes/Getting Started.md` exists.
5. Confirm the sidebar shows exactly one entry: **Getting Started**.
6. Confirm the editor pane displays the welcome content (heading "Hello, stranger!" or equivalent).
