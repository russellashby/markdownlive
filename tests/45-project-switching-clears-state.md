# Test 45 — Switching projects clears editor state and re-targets the terminal

## Story

As a user, I want switching the working folder to feel like a clean handoff — the previous note shouldn't bleed into the new project's view, and any running shell should be torn down so it isn't pointing at the old folder behind my back.

## Acceptance criteria

**Given** I have a project open with a note loaded and the terminal pane visible
**When** I switch to a different project via **File → Open Recent** or the splash recents
**Then** any in-flight autosave is flushed silently to the previous project (no confirm dialog)
**And** the editor closes the previous note (no stale content shown)
**And** the sidebar reloads against the new project root
**And** the terminal pane is torn down — the old PTY is killed, scrollback is wiped — and (if it was visible) re-spawned in the new project's folder, at the same width

## Manual verification

1. Have two distinct project folders ready, e.g. `~/Projects/foo` and `~/Projects/bar`, each with at least one `.md` file.
2. Open `~/Projects/foo` from the splash. Open a note and type a few characters; let the autosave debounce settle to **Saved**.
3. Open the terminal pane (Cmd+`) and type a few commands so there's visible scrollback. Run `pwd` and confirm it prints `~/Projects/foo`.
4. Resize the terminal divider to a non-default width and confirm.
5. From the **File** menu, open **Open Recent** and pick `~/Projects/bar` (or use **Open Folder…** to pick it the first time).
6. Confirm:
   * The sidebar replaces foo's notes with bar's notes.
   * The editor is empty (no carry-over of foo's note).
   * The terminal pane is still visible at the same width you set in step 4.
   * The terminal scrollback is wiped — only a fresh prompt is shown.
   * Running `pwd` in the terminal prints `~/Projects/bar`.
7. Reopen the note you edited in step 2 by switching back to `~/Projects/foo` via **Open Recent**. Confirm your typed characters were saved (the autosave flushed before the switch).
