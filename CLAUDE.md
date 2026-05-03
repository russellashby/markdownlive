# Project notes for Claude

MarkdownLive — a personal macOS markdown editor. Electron + Milkdown Crepe + plain `.md` files in a user-chosen project folder. See `README.md` for features and run/build commands.

## Working conventions

* I prefer a brief plan + clarifying questions before code. Don't dive into implementation without checking the approach.

* Commit only on explicit approval ("please commit", "commit it"). Never auto-commit at end of work.

* Use cases live in `use_cases/`. Move files from `use_cases/to-do/` to `use_cases/done/` once shipped. The `use_cases/` directory is intentionally untracked.

* Each UC ships 2–3 manual acceptance tests under `tests/` — Given/When/Then style, sequentially numbered. Update `tests/README.md` with a new section.

* Stories live in `stories/` (untracked). They are rough context I drop in; you decompose each into a UC + acceptance criteria in `use_cases/to-do/` before coding.

* Commits follow the existing style: imperative subject, body explains *why*; HEREDOC body with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer. No "Generated with Claude Code" line.

* After meaningful feature work I often ask for a new mac build. Bump the minor version in `package.json`, run `npm install --package-lock-only`, then `npm run dist:mac`. DMGs land in `release/`.

* **Branching:** small UCs (a few files, no native deps, no big layout shifts) ship straight to main. Larger work that could leave main broken mid-flight — new native modules, new panes/layout sections, anything spanning many commits before it works end-to-end — goes on a `feat/<name>` branch and merges via PR (`gh pr create … && gh pr merge <n> --merge --delete-branch`). The terminal pane (UC-07) was the first time we used this; precedent for next time.

## Non-obvious details

* **Project folder** is the single source of truth for everything path-related. `currentProjectDir` in `main.js` is set after the user picks via the splash or **File → Open Recent** / **Open Folder…** (Cmd+O). Every file/image/terminal handler calls `requireProject()` and throws if no project is open. The IPC channel is still named `notes-dir-changed` for back-compat — the rename is not worth the churn.

* **Recents** are stored at `<userData>/recent-projects.json` (capped at 10, most-recent first, stale paths filtered on read). The Electron menu is rebuilt after every successful `setProject` so **File → Open Recent** stays current.

* **First launch** shows a splash overlay (`#splash` in `index.html`). The renderer hides the splash only after `openProject` succeeds; before that, the editor / sidebar / terminal are inert. There is no auto-open of the last project — every launch goes through the splash unless the renderer detects a project already set in main (e.g. after a Cmd+R reload).

* **`.markdownlive/`** is the editor's per-project metadata folder. New image uploads land at `<project>/.markdownlive/images/foo.png`; the markdown source records the literal path `.markdownlive/images/foo.png`. Old `images/foo.png` references in pre-existing notes still resolve because the proxy is generic.

* **Image rendering** uses Crepe's `proxyDomURL` hook (`src/renderer.js`): any non-absolute URL is rewritten to `file://<projectDir>/<relative>`. The CSP in `index.html` must allow `file:` under `img-src` for this to work.

* **Drop handler** in `src/renderer.js` lets non-markdown drops bubble through to Crepe (so editor image drops still work). Only `.md` drops are intercepted for the import flow.

* **`fs.watch`** is recursive (macOS/Windows only — Linux would silently miss nested changes) and runs against the current project. Events whose top-level segment is in `WATCH_IGNORE_PREFIXES` (`node_modules`, `.git`, `.markdownlive`) are dropped — without this the sidebar would thrash on `npm install` or any image upload. Watcher is torn down + re-attached on every project switch.

* **Sidebar** is fully recursive — `walkProject` in `main.js` returns `{ name, path, mtime, dir }` per file, where `dir` is the relative directory string (`''` for root). Renderer's `buildTree` + `renderTree` produce the nested view; folder collapse-state is keyed by *path* (e.g. `use_cases/done`), not name.

* **Renderer state** persists in `localStorage` under `mdedit.*` keys: `mdedit.mode` (`live`|`raw`, global), `mdedit.sidebarCollapsed` (`0`|`1`, global), `mdedit.terminalVisible` (`0`|`1`, global), `mdedit.terminalWidth` (px, global), and `mdedit.foldersCollapsed` — **a JSON object keyed by absolute project path**, value is an array of collapsed folder paths within that project. UI prefs follow the user across projects; folder-collapse memory is per-project.

* **Project switching** flow (`switchProject` in `src/renderer.js`): flush autosave silently → kill PTY + dispose xterm + clear host → close current note → call `openProject` (catches and `alert`s on bad path) → reload sidebar → re-spawn terminal if it was visible. Terminal width and visibility flag are preserved across the switch so the pane reappears at the same size pointing at the new cwd.

* **Terminal pane** uses `xterm.js` in the renderer talking to `node-pty` in the main process. `node-pty` is a native module — a `postinstall` script runs `electron-rebuild` so `npm install` produces an Electron-compatible build automatically, and `node-pty` is in `asarUnpack` so the binary loads inside the packaged `.app`. Spawned shells inherit `process.env` and start with `cwd: <currentProjectDir>`.

* **xterm sizing** depends on a `ResizeObserver` on the terminal host element. The CSS grid column animates from 0 to the target width over 160ms, so a single `fit()` immediately after `terminal.open(...)` runs against a 0-px container and produces \~3 cols. The observer refits whenever the host actually resizes, which covers transition end, divider drag, and window resize. The fit also short-circuits if the host has zero dimensions, so it's safe to call eagerly.

* **Live reload of open file** — when `fs.watch` fires for the currently open note and `pendingMarkdown === lastSavedMarkdown` (no unsaved local edits), the editor is re-mounted with the on-disk content. Skip if the user has unsaved typing — their save will overwrite. Raw mode preserves caret position; live mode does a full Crepe remount.

* **Builds are unsigned**. First launch on any Mac requires right-click → Open. The `electron-builder` mac config intentionally sets `identity: null`.

* **`markdown_demo.md`** at the repo root is a local scratch file used to populate the README screenshot. Gitignored. Don't track.

## Code style

* No code comments unless they explain a non-obvious *why* (a workaround, a hidden constraint).

* No automated tests; the manual `tests/` suite is the only test discipline.

* Don't add backwards-compatibility shims, dead `_var` renames, or "// removed" comments. Delete code outright.

* Don't introduce abstractions for hypothetical future requirements. Inline duplication of two similar blocks is fine.

## Known gaps

* Clipboard image paste — not verified working (only drag-drop and the slash-command upload picker are confirmed).

* Image references aren't portable to third-party markdown viewers when notes live in subfolders (relative path resolves against the `.md` file's directory there, not the notes root).

* Folder create / move / rename via the UI — not built; do it in Finder or the shell.

* No code signing or notarization.

