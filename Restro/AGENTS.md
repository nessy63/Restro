# AGENTS.md

## Project overview

Full-stack restaurant website ("Delicious Restaurant") — static HTML + CSS + vanilla JS frontend with IndexedDB as local database. No build system, no package manager, no framework. Open `ui.html` in a browser to run.

## Structure

- `ui.html` — single-page site: hero, menu grid (20 items), footer, sign-up/sign-in modals, cart panel, order confirmation, order history, location banner. All inline `<style>` for the main layout.
- `signup.css` — modal overlay, Google auth button, sign-in button, and form input styles.
- `Frontend/db.js` — IndexedDB wrapper (users, orders, cart stores)
- `Frontend/auth.js` — Signup, signin, session management, UI state updates
- `Frontend/cart.js` — Shopping cart with IndexedDB persistence per user
- `Frontend/orders.js` — Order placement with geolocation, reverse geocoding, order history
- `Frontend/app.js` — Menu data (20 items), modal setup, location detection, app initialization

## Architecture

### Database (IndexedDB)
- **users** store: `{ id, name, email, password, createdAt }` — email indexed (unique)
- **orders** store: `{ id, userId, userName, userEmail, items[], total, location{latitude, longitude, address}, status, date }` — userId indexed
- **cart** store: `{ id, userId, itemId, name, price, quantity, image }` — userId indexed

### Auth Flow
- Sign up: creates user in IndexedDB, auto signs in, stores session in localStorage
- Sign in: looks up by email (unique index) or name, validates password, stores session
- Session: `localStorage.setItem('sessionId', userId)` — persists across page reloads
- Sign out: clears session from localStorage, clears cart from memory

### Order Flow
1. User adds items to cart (requires login)
2. Cart stored in IndexedDB per user
3. On checkout: browser requests geolocation (high accuracy)
4. Reverse geocodes coordinates via OpenStreetMap Nominatim API
5. Order saved to IndexedDB with items, total, and location
6. Cart cleared, confirmation modal shown

## Gotchas

- **CSS variable dependency**: `signup.css` uses CSS variables defined only in `ui.html`'s inline `<style>` block.
- **Menu items are JS data**: The 20 menu items are defined as a `MENU_ITEMS` array in `app.js` and rendered by `renderMenu()`.
- **Location requires HTTPS or localhost**: Geolocation API only works over HTTPS or on localhost.
- **No password hashing**: Passwords stored in plain text — fine for local demo, not for production.
- **IndexedDB is origin-scoped**: Data persists per domain/origin.

## Conventions

- CSS theme variables are defined in `ui.html` `:root` block. Reference these in new CSS.
- Modal styles and auth-related styles live in `signup.css`; layout styles live inline in `ui.html`.
- All JS modules are loaded in `ui.html` bottom in dependency order: db → auth → cart → orders → app.
- Notifications use the `showNotification(message, type)` function from `auth.js`.
