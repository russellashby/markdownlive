# Test 30 — Sidebar groups notes by folder

## Story

As a user, I want notes that I organise into subfolders inside `~/MarkdownNotes/` to appear under those folder names in the sidebar so that I can keep distinct topics visually separated.

## Acceptance criteria

**Given** `~/MarkdownNotes/` contains both files at the root and files inside subfolders
**When** the app loads (or refreshes after a directory change)
**Then** root-level notes appear at the top of the sidebar (most-recent first)
**And** each subfolder appears below as a header with its notes nested under it
**And** folder headers are sorted alphabetically

## Manual verification

1. From a terminal, set up a mix of root and subfolder notes:
   ```sh
   mkdir -p ~/MarkdownNotes/Work ~/MarkdownNotes/Personal
   printf '# Standalone\n' > ~/MarkdownNotes/standalone.md
   printf '# Sprint plan\n' > ~/MarkdownNotes/Work/sprint-plan.md
   printf '# OKRs\n' > ~/MarkdownNotes/Work/okrs.md
   printf '# Garden\n' > ~/MarkdownNotes/Personal/garden.md
   ```
2. Start (or restart) the app.
3. Confirm "standalone" appears at the top of the sidebar.
4. Confirm two folder headers appear below: "Personal" then "Work" (alphabetical).
5. Expand both (if not already expanded) and confirm the nested entries are correct: "Personal" contains "garden"; "Work" contains "sprint-plan" and "okrs".
6. Click any nested note and confirm it loads its content in the editor and is highlighted.
