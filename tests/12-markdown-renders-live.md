# Test 12 — Markdown syntax renders live as you type

## Story

As a user, I want my markdown formatting to render in place as I type so that I see the final document without a separate preview pane.

## Acceptance criteria

**Given** the editor is open and focused
**When** I type markdown syntax
**Then** the syntax is rendered in place as soon as the construct is recognised:

| Input                        | Renders as                       |
| ---------------------------- | -------------------------------- |
| `# heading` + Enter          | Large bold heading               |
| `## heading` + Enter         | Smaller bold heading             |
| `**word**`                   | **word** (bold)                  |
| `_word_` or `*word*`         | *word* (italic)                  |
| `` `code` ``                 | `code` (monospace, tinted)       |
| `- item` + Enter             | Bulleted list with hanging indent |
| `1. item` + Enter            | Numbered list                    |
| `> quote`                    | Indented blockquote with accent   |
| ` ``` ` + language + Enter   | Fenced code block                |

## Manual verification

1. Create a new note.
2. Type each input above and observe the rendering.
3. Confirm there is no separate "raw markdown" pane visible.
4. Confirm bold, italic, and code transformations apply without losing the cursor position.
5. Toggle a transformation off (e.g. unbold a word) and confirm it reverts cleanly.
