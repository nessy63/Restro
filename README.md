# Delicious Restaurant

A full-stack restaurant website with menu, cart, orders, table reservations, and admin panel.

## Local Setup

1. Copy `Restro/config.example.js` to `Restro/config.js`
2. Fill in your real values in `config.js`
3. Open `Restro/ui.html` in a browser

## Deploy to Render

### Prerequisites

1. Push this repo to GitHub (make sure `config.js` is NOT committed — it's gitignored)
2. Create a free [Render account](https://render.com)

### Steps

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Static Site**
2. Connect your GitHub repo
3. Render will detect `render.yaml` and auto-configure. If not, set:
   - **Build Command:** `./build.sh`
   - **Publish Directory:** `./Restro`
4. In the **Environment** tab, add these variables (from your real credentials):

   | Variable | Value |
   |----------|-------|
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `ADMIN_EMAIL` | Admin panel email |
   | `ADMIN_PASSWORD` | Admin panel password |

5. Click **Create Static Site**
6. Your site will be live at `https://delicious-restaurant.onrender.com`

### How It Works

The build script (`build.sh`) runs during deployment and generates `config.js` from your Render environment variables. This keeps secrets out of git while making them available to the frontend at runtime.

## Configuration

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `ADMIN_EMAIL` | Admin panel login email |
| `ADMIN_PASSWORD` | Admin panel login password |

## Security Warning

**If you previously committed secrets to this repository, rotate them immediately.**

- The Google OAuth client secret (`GOCSPX-...`) was previously present as a JSON file in the repo.
  Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create new credentials.
- The admin password (`Admin@123`) was previously hardcoded in `admin.html`.
  Change it in your Render environment variables to a strong, unique password.

Git history retains deleted files and old content. Even after removal, secrets remain in previous commits.
Use `git filter-branch` or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to scrub history,
and force-push / re-clone after cleaning.
