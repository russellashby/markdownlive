# Project notes for Claude

MarkdownLive — a personal macOS markdown editor. Electron + Milkdown Crepe + plain `.md` files in `~/MarkdownNotes/`. See `README.md` for features and run/build commands.

## Working conventions

- I prefer a brief plan + clarifying questions before code. Don't dive into implementation without checking the approach.
- Commit only on explicit approval ("please commit", "commit it"). Never auto-commit at end of work.
- Use cases live in `use_cases/`. Move files from `use_cases/to-do/` to `use_cases/done/` once shipped. The `use_cases/` directory is intentionally untracked.
- Each UC ships 2–3 manual acceptance tests under `tests/` — Given/When/Then style, sequentially numbered. Update `tests/README.md` with a new section.
- Commits follow the existing style: imperative subject, body explains *why*; HEREDOC body with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer. No "Generated with Claude Code" line.
- After meaningful feature work I often ask for a new mac build. Bump the minor version in `package.json`, run `npm install --package-lock-only`, then `npm run dist:mac`. DMGs land in `release/`.
- **Branching:** small UCs (a few files, no native deps, no big layout shifts) ship straight to main. Larger work that could leave main broken mid-flight — new native modules, new panes/layout sections, anything spanning many commits before it works end-to-end — goes on a `feat/<name>` branch and merges via PR (`gh pr create … && gh pr merge <n> --merge --delete-branch`). The terminal pane (UC-07) was the first time we used this; precedent for next time.

## Non-obvious details

- **Image rendering** uses Crepe's `proxyDomURL` hook (`src/renderer.js`): markdown source keeps `images/foo.png`; rendering rewrites to `file:///<NOTES_DIR>/images/foo.png`. The CSP in `index.html` must allow `file:` under `img-src` for this to work.
- **Drop handler** in `src/renderer.js` lets non-markdown drops bubble through to Crepe (so editor image drops still work). Only `.md` drops are intercepted for the import flow.
- **`fs.watch`** is recursive (macOS/Windows only — Linux would silently miss nested changes). Drives the sidebar refresh on disk changes.
- **Sidebar grouping** is one level deep only. Files at `~/MarkdownNotes/a/b/note.md` won't appear — intentional, documented.
- **Renderer state** persists in `localStorage` under `mdedit.*` keys: `mdedit.mode` (`live`|`raw`), `mdedit.foldersCollapsed` (JSON array of folder names), `mdedit.sidebarCollapsed` (`0`|`1`), `mdedit.terminalVisible` (`0`|`1`), `mdedit.terminalWidth` (px).
- **Terminal pane** uses `xterm.js` in the renderer talking to `node-pty` in the main process. `node-pty` is a native module — a `postinstall` script runs `electron-rebuild` so `npm install` produces an Electron-compatible build automatically, and `node-pty` is in `asarUnpack` so the binary loads inside the packaged `.app`. Spawned shells inherit `process.env` and start with `cwd: ~/MarkdownNotes/`.
- **xterm sizing** depends on a `ResizeObserver` on the terminal host element. The CSS grid column animates from 0 to the target width over 160ms, so a single `fit()` immediately after `terminal.open(...)` runs against a 0-px container and produces ~3 cols. The observer refits whenever the host actually resizes, which covers transition end, divider drag, and window resize. The fit also short-circuits if the host has zero dimensions, so it's safe to call eagerly.
- **Live reload of open file** — when `fs.watch` fires for the currently open note and `pendingMarkdown === lastSavedMarkdown` (no unsaved local edits), the editor is re-mounted with the on-disk content. Skip if the user has unsaved typing — their save will overwrite. Raw mode preserves caret position; live mode does a full Crepe remount.
- **Builds are unsigned**. First launch on any Mac requires right-click → Open. The `electron-builder` mac config intentionally sets `identity: null`.
- **`markdown_demo.md`** at the repo root is a local scratch file used to populate the README screenshot. Gitignored. Don't track.

## Code style

- No code comments unless they explain a non-obvious *why* (a workaround, a hidden constraint).
- No automated tests; the manual `tests/` suite is the only test discipline.
- Don't add backwards-compatibility shims, dead `_var` renames, or "// removed" comments. Delete code outright.
- Don't introduce abstractions for hypothetical future requirements. Inline duplication of two similar blocks is fine.

## Known gaps

- Clipboard image paste — not verified working (only drag-drop and the slash-command upload picker are confirmed).
- Image references aren't portable to third-party markdown viewers when notes live in subfolders (relative path resolves against the `.md` file's directory there, not the notes root).
- Folder create / move / rename via the UI — not built; do it in Finder or the shell.
- No code signing or notarization.
