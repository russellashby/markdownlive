# Test 35 — Toggle between raw and live editing modes

## Story

As a user, I want to switch between live (WYSIWYG) and raw markdown editing on demand so that I can see and tweak the literal source when I need to.

## Acceptance criteria

**Given** a note is open in live mode (default)
**When** I click the **Raw** button in the pane header
**Then** the editor swaps to a plain-text view showing the file's literal markdown source
**And** the **Raw** button shows an active visual state
**And** clicking the button again swaps back to the live WYSIWYG editor with my edits preserved

## Manual verification

1. Open a note that contains rich markdown (e.g. headings, bold, a list, and an image — see the welcome note or use Test 33's note).
2. Confirm the editor renders the content as formatted text (live mode).
3. Click the **Raw** button in the pane header (next to **Delete**).
4. Confirm:
   - The editor area now shows the literal markdown source (e.g. `# Heading`, `**bold**`, `![](images/...)`).
   - The **Raw** button visibly indicates it is active (highlighted).
5. Edit the raw markdown — for example, add a new line `## A new section` near the top.
6. Click **Raw** again.
7. Confirm:
   - The editor swaps back to the live formatted view.
   - The new heading appears as a real H2 heading.
   - No earlier content was lost.
