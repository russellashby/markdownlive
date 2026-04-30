# Test 17 — Save status reflects current state

## Story

As a user, I want a clear indication of whether my work is currently saved or pending save so that I know when it is safe to close the app.

## Acceptance criteria

**Given** a note is open
**When** I observe the status bar in the bottom-right
**Then** it shows one of these states:
- **Saved** — the editor content matches what is on disk
- **Unsaved** — content has diverged from disk and a write is queued
- **Saving…** — a write is in flight

**And** the transitions are: `Saved` → (type) → `Unsaved` → (debounce expires) → `Saving…` → (write completes) → `Saved`

## Manual verification

1. Open a note. Confirm the status reads **Saved**.
2. Type a single character. Confirm the status changes to **Unsaved** within a frame.
3. Hold for 1.5 seconds without typing. Observe the brief transition through **Saving…** to **Saved**.
4. Type rapidly for several seconds. Confirm the status stays **Unsaved** the whole time (does not flicker between states on every keystroke).
5. Stop typing. Confirm it transitions to **Saving…** briefly and then settles on **Saved**.
