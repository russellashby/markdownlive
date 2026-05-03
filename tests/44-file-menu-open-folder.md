# Test 44 — File menu provides Open Folder and Open Recent

## Story

As a user, I want familiar **File → Open Folder…** and **File → Open Recent** entries (with the standard **Cmd+O** shortcut) so that switching project context feels native and I can jump back to a previous project quickly.

## Acceptance criteria

**Given** the app is running (with or without a project open)
**When** I look at the menu bar
**Then** a **File** menu sits immediately after the app menu, containing **Open Folder…** (Cmd+O) and **Open Recent** ▶
**And** **Open Recent** lists every recent project, most-recent first, with each entry's home prefix shortened to `~`
**And** when no recent projects exist the submenu shows a single disabled entry reading **No recent projects**
**And** selecting **Open Folder…** opens the OS folder picker; cancelling it leaves the app unchanged
**And** the menu items work the same way from the splash screen and from inside an open project

## Manual verification

1. Open the app and pick a project from the splash if needed.
2. Open the **File** menu in the macOS menu bar.
3. Confirm:
   * Two items: **Open Folder…** (showing **⌘O**) and **Open Recent ▶**.
   * Hovering **Open Recent** expands a submenu containing the project you just opened, with the path shortened (`~/...`).
4. Press **Cmd+O**. Confirm the OS folder picker appears.
5. Cancel the picker. Confirm the app is still showing the same project unchanged.
6. Quit and relaunch. Don't pick a folder yet — the splash should be visible.
7. Open **File → Open Recent** from the splash. Confirm the recent project from step 1 is listed and clicking it opens that project (splash hides, sidebar populates).
8. To verify the empty-recents state, quit the app, run `rm -f ~/Library/Application\ Support/MarkdownLive/recent-projects.json`, relaunch, and check **File → Open Recent** shows a single disabled **No recent projects** entry.
