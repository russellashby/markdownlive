# Test 46 — Sidebar shows nested folders recursively

## Story

As a user, I want the sidebar to reflect the actual folder structure of my project — including notes that live more than one level deep — so that the app can be pointed at a real codebase or project tree without losing notes.

## Acceptance criteria

**Given** the open project contains `.md` files in nested subfolders (more than one level deep)
**When** the sidebar renders
**Then** every folder containing a `.md` descendant appears as a collapsible header
**And** notes nested two or more levels deep are visible under the right folder hierarchy
**And** clicking a nested note opens it in the editor
**And** folder collapse-state is remembered per-project (collapsing `a/b` in project X does not collapse a same-named `a/b` in project Y)
**And** folders named `node_modules`, `.git`, or `.markdownlive` never appear in the sidebar regardless of depth

## Manual verification

1. With a project open, create a deep tree of notes:
   ```sh
   mkdir -p "$PROJECT"/level1/level2/level3
   printf '# L1\n' > "$PROJECT"/level1/L1.md
   printf '# L2\n' > "$PROJECT"/level1/level2/L2.md
   printf '# L3\n' > "$PROJECT"/level1/level2/level3/L3.md
   mkdir -p "$PROJECT"/node_modules/some-pkg
   printf '# Should be hidden\n' > "$PROJECT"/node_modules/some-pkg/README.md
   ```
2. Confirm the sidebar refreshes within ~1 second and shows:
   * `level1` as a collapsible header with `L1` inside.
   * `level2` nested under `level1` with `L2` inside.
   * `level3` nested under `level2` with `L3` inside.
   * No `node_modules` folder anywhere.
3. Click `L3` and confirm it opens in the editor.
4. Collapse `level2`. Confirm `level3` and `L3` disappear from view; `L2` remains visible directly under `level1`.
5. Switch to a different project via **File → Open Recent**, then switch back. Confirm `level2` is still collapsed (per-project memory).
6. Open a different project that happens to contain its own `level2` folder; confirm it is *not* collapsed there (state is scoped per-project, not by name).
