# Test 21 — Spell check underlines misspelled words

## Story

As a user, I want misspelled words flagged visually as I type so that I can correct them without breaking my flow.

## Acceptance criteria

**Given** the editor is open
**When** I type a word that is not in the system dictionary
**Then** the word receives a red wavy underline
**And** correctly spelled words have no underline
**And** the dictionary in use is the one configured by Electron (`en-GB` first, then `en-US`)

## Manual verification

1. Open a new note.
2. Type: `The quikc brwn fox jumps ovre the lazy dog.`
3. Confirm `quikc`, `brwn`, and `ovre` show red wavy underlines.
4. Confirm `The`, `fox`, `jumps`, `the`, `lazy`, `dog` do **not** show underlines.
5. Type a Britsh-spelling word like `colour`. Confirm it is not flagged (en-GB dictionary is active).
