# Test 15 — Content width scales with window size

## Story

As a user, I want the editor area to use more horizontal space when I make the window bigger or go fullscreen so that I am not staring at a narrow column on a wide display.

## Acceptance criteria

**Given** the app is running in a normal window (~1200px wide)
**When** I resize or fullscreen the window
**Then** the editor content area widens up to ~1100px (default cap)
**And** at viewport widths ≥ 1400px the cap rises to ~1400px with larger gutters
**And** the content remains horizontally centred within the editor pane
**And** content never spans edge-to-edge with no padding

## Manual verification

1. At default window size, confirm the editor content has comfortable side gutters.
2. Resize the window wider. Confirm the content area grows but does not become uncomfortably wide.
3. Press **Cmd+Ctrl+F** (fullscreen) on a display ≥ 1400px wide.
4. Confirm the content area is wider than in normal mode but still has visible side gutters.
5. Exit fullscreen and confirm the content reflows back to the smaller cap.
