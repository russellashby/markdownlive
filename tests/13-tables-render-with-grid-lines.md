# Test 13 — Tables render with grid lines

## Story

As a user, I want tables to render with visible borders and a tinted header row so that they read as tables, not as ambiguous columns of text.

## Acceptance criteria

**Given** the editor contains GFM table syntax
**When** the table is rendered
**Then** every cell has a 1px border on all sides
**And** the header row has a tinted background and bold weight
**And** even-numbered body rows have a subtle alternating background

## Manual verification

1. Create a new note.
2. Paste or type:
   ```markdown
   | Name  | Role        | Active |
   | ----- | ----------- | ------ |
   | Alice | Engineering | yes    |
   | Bob   | Design      | no     |
   | Carol | Product     | yes    |
   ```
3. Confirm the rendered table shows:
   - Visible borders around every cell.
   - Header row ("Name | Role | Active") with a slightly darker background and bold text.
   - The "Bob" row visually distinct from the "Alice" / "Carol" rows (zebra striping).
