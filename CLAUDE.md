# Project notes for Claude

MarkdownLive — a personal macOS markdown editor. Electron + Milkdown Crepe + plain `.md` files in `~/MarkdownNotes/`. See `README.md` for features and run/build commands.

## Working conventions

- I prefer a brief plan + clarifying questions before code. Don't dive into implementation without checking the approach.
- Commit only on explicit approval ("please commit", "commit it"). Never auto-commit at end of work.
- Use cases live in `use_cases/`. Move files from `use_cases/to-do/` to `use_cases/done/` once shipped. The `use_cases/` directory is intentionally untracked.
- Each UC ships 2–3 manual acceptance tests under `tests/` — Given/When/Then style, sequentially numbered. Update `tests/README.md` with a new section.
- Commits follow the existing style: imperative subject, body explains *why*; HEREDOC body with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` trailer. No "Generated with Claude Code" line.
- After meaningful feature work I often ask for a new mac build. Bump the minor version in `package.json`, run `npm install --package-lock-only`, then `npm run dist:mac`. DMGs land in `release/`.

## Non-obvious details

- **Image rendering** uses Crepe's `proxyDomURL` hook (`src/renderer.js`): markdown source keeps `images/foo.png`; rendering rewrites to `file:///<NOTES_DIR>/images/foo.png`. The CSP in `index.html` must allow `file:` under `img-src` for this to work.
- **Drop handler** in `src/renderer.js` lets non-markdown drops bubble through to Crepe (so editor image drops still work). Only `.md` drops are intercepted for the import flow.
- **`fs.watch`** is recursive (macOS/Windows only — Linux would silently miss nested changes). Drives the sidebar refresh on disk changes.
- **Sidebar grouping** is one level deep only. Files at `~/MarkdownNotes/a/b/note.md` won't appear — intentional, documented.
- **Renderer state** persists in `localStorage` under `mdedit.*` keys: `mdedit.mode` (`live`|`raw`), `mdedit.foldersCollapsed` (JSON array of folder names), `mdedit.sidebarCollapsed` (`0`|`1`).
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
