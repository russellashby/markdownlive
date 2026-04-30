# Test 23 — Add to Dictionary persists across sessions

## Story

As a user, I want to teach the editor proper nouns and jargon so that they stop being flagged as misspellings every time I write them.

## Acceptance criteria

**Given** a word is flagged as misspelled
**When** I right-click and choose **Add to Dictionary**
**Then** the red underline disappears from every instance of that word in the document
**And** the word is no longer flagged in any other note
**And** the word remains in the dictionary after restarting the app

## Manual verification

1. Type a made-up name twice in the same note: `Zeflorian and Zeflorian Industries`. Confirm both are underlined.
2. Right-click the first `Zeflorian`, choose **Add to Dictionary**.
3. Confirm both occurrences lose their underlines.
4. Create a new note. Type `Zeflorian` again. Confirm it is not underlined.
5. Quit the app fully and relaunch.
6. Confirm `Zeflorian` is still not underlined in any note.
