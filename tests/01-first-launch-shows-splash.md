# Test 01 — First launch shows the project picker splash

**Requires clean state.**

## Story

As a first-time user, I want to be asked which folder to use as my project root so that the app never silently writes notes into a place I didn't choose.

## Acceptance criteria

**Given** I have never opened the app before (no recent projects on disk)
**When** I launch the app
**Then** a splash screen is shown with an **Open folder…** button
**And** the **Recent projects** section reads "No recent projects yet."
**And** the editor is not visible until I pick a folder
**And** picking an empty folder shows an empty sidebar (no welcome note is created)

## Manual verification

1. Quit the app if it is running.
2. Wipe stored recents so this is a true first launch:
   ```sh
   rm -f ~/Library/Application\ Support/MarkdownLive/recent-projects.json
   ```
3. `npm start`
4. Confirm:
   * The splash screen is visible, dark card centred on the window.
   * Title reads **MarkdownLive** with a single blue **Open folder…** button.
   * Under **Recent projects** the message reads "No recent projects yet."
   * No editor / sidebar is visible behind the splash.
5. Click **Open folder…**, create or pick an empty folder.
6. Confirm:
   * The splash disappears.
   * The sidebar is empty (no auto-created `Getting Started.md`).
   * The editor area shows no open note.
7. Quit and relaunch. Confirm the splash returns (the app does not auto-open the last project) and the chosen folder is now listed under **Recent projects**.
