# Test 11 — Files persist as plain markdown

## Story

As a user, I want my notes to live as plain `.md` files on disk so that I can use them with other tools (grep, git, Obsidian, iCloud sync, etc.) without any proprietary lock-in.

## Acceptance criteria

**Given** I have written a note in the editor
**When** the file is saved to disk
**Then** the contents are valid CommonMark / GFM markdown
**And** there is no proprietary wrapper, frontmatter, or metadata added by the app
**And** the file can be opened and edited in any external text editor

## Manual verification

1. Create a note containing varied markdown (headings, bold, italic, code block, list, table, link).
2. Wait 2 seconds for autosave.
3. Open the file in an external editor:
   ```sh
   cat "~/MarkdownNotes/<name>.md"
   ```
4. Confirm the content is plain markdown — `# Heading`, `**bold**`, `- item`, fenced code blocks, etc.
5. Confirm there is no JSON wrapper, no YAML frontmatter, and no binary content.
6. Edit the file externally (e.g. `echo "external edit" >> ~/MarkdownNotes/<name>.md`), restart the app, and confirm the change appears in the editor.
