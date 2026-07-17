# AGENTS.md

## Project overview

Static restaurant landing page ("Delicious Restaurant") — plain HTML + CSS + vanilla JS. No build system, no package manager, no framework. Open `ui.html` in a browser to run.

## Structure

- `ui.html` — single-page site: hero, menu grid (20 items), footer, sign-up and sign-in modals. All inline `<style>` for the main layout, plus a `<script>` that generates menu cards.
- `signup.css` — modal overlay, Google auth button, sign-in button, and form input styles. Loaded by `ui.html`.
- `Frontend/signup.js` — sign-up modal open/close/submit logic.
- `Frontend/signin.js` — sign-in modal open/close/submit logic.
- `Back end/` — empty, reserved for future backend work.

## Gotchas

- **CSS variable dependency**: `signup.css` uses CSS variables (`--bg-card`, `--primary-red`, `--text-muted`, etc.) that are defined only in `ui.html`'s inline `<style>` block. `signup.css` cannot be loaded standalone — it will have missing colors and fonts.
- **Menu items are JS-generated**: The 20 menu cards in `ui.html` are created by a `for` loop in an inline `<script>` block (lines ~451–476). To change menu structure, edit the `cardHTML` template in that loop, not individual HTML elements.
- **No backend**: Sign-in and sign-up forms use `event.preventDefault()` and `alert()` stubs. No database, no auth provider, no API calls.
- **Footer copyright** is hardcoded to 2026.

## Conventions

- CSS theme variables are defined at the top of the inline `<style>` in `ui.html` (`:root` block). Reference these variables in any new CSS rather than hardcoding colors.
- Modal styles and auth-related styles live in `signup.css`; layout and component styles live inline in `ui.html`. Keep this split when adding UI.
- Scripts are loaded at the bottom of `<body>` in `ui.html`. New JS files go in `Frontend/`.
