# Test 14 — Word count updates live

## Story

As a writer, I want a running word count so that I can pace my drafts.

## Acceptance criteria

**Given** the editor is open
**When** I type or delete text
**Then** the word count in the status bar updates in real time
**And** an empty note shows `0 words`
**And** singular and plural forms are correct (`1 word`, `2 words`)
**And** markdown punctuation is not counted as words (e.g. `**bold**` counts as one word, not three)

## Manual verification

1. Create a new note. Confirm the status bar reads `0 words`.
2. Type one word. Confirm it reads `1 word`.
3. Type a second word. Confirm `2 words`.
4. Type `**bold**`. Confirm it reads as one additional word, not three.
5. Delete all content. Confirm it returns to `0 words`.
