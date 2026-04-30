# Test 24 — Edit menu exposes macOS substitutions

## Story

As a macOS user, I want native autocorrect features (smart quotes, smart dashes, system text replacements) available from the Edit menu so that the app feels like a first-class macOS citizen.

## Acceptance criteria

**Given** the app is running on macOS
**When** I open the **Edit** menu in the menu bar
**Then** there is a **Substitutions** submenu containing:
- Show Substitutions
- Smart Quotes
- Smart Dashes
- Text Replacement

**And** there is a **Spelling and Grammar** submenu
**And** toggling **Smart Quotes** on causes typed `"hello"` to render as `“hello”`
**And** toggling **Smart Dashes** on causes typed `--` to render as `—`
**And** macOS system text replacements (System Settings > Keyboard > Text Replacements) work in the editor when **Text Replacement** is enabled

## Manual verification

1. Open **Edit > Substitutions** from the menu bar. Confirm all four entries listed above are present.
2. Ensure **Smart Quotes** is enabled (a checkmark appears next to it).
3. Type `She said "hello"`. Confirm the straight quotes are replaced with `“hello”`.
4. Ensure **Smart Dashes** is enabled. Type `well--maybe`. Confirm `--` becomes an em-dash `—`.
5. In macOS System Settings > Keyboard > Text Replacements, add a temporary entry: replace `omw` with `On my way!`.
6. Ensure **Text Replacement** is enabled in the Edit > Substitutions submenu.
7. In the editor type `omw ` (with a trailing space). Confirm it expands to `On my way! `.
8. Remove the temporary text-replacement entry from System Settings.
