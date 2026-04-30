# Test 22 — Right-click shows spelling suggestions

## Story

As a user, I want to fix a typo by right-clicking and picking a suggestion so that I do not have to retype the word manually.

## Acceptance criteria

**Given** a misspelled word is present in the editor
**When** I right-click (or two-finger tap) on that word
**Then** a context menu appears
**And** the top of the menu lists up to several spelling suggestions
**And** clicking a suggestion replaces the misspelled word with that suggestion
**And** below the suggestions there is an **Add to Dictionary** option
**And** standard editing actions (Cut / Copy / Paste / Select All) appear below

## Manual verification

1. Type the misspelled word `recieve`.
2. Right-click on the word.
3. Confirm the context menu opens with `receive` and similar candidates near the top.
4. Click `receive`. Confirm the word in the editor is replaced with `receive`.
5. Confirm the cursor and surrounding text are otherwise unchanged.
6. Right-click on a correctly-spelled word — confirm the context menu still shows Cut / Copy / Paste but no "No suggestions" entry and no "Add to Dictionary" entry.
