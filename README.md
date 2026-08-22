<div align="center">
  <img src="https://assets.hackclub.com/flag-standalone.svg" width="100" alt="Hack Club flag" />
  <h2>Wild YSWS</h2>
  <p>A Next.js + Airtable You-Ship-We-Ship platform — sign in, submit projects tracked against Hackatime, and spend earned barks in the shop.</p>
</div>

---

## What this is

Wild is a YSWS (You Ship, We Ship) site for Hack Club. Participants sign in with their
Hack Club identity, connect Hackatime (tracks a user's coding time), submit projects for review, and spend barks
(this program's currency) in a shop. Staff get an admin panel to manage the shop,
review submissions, and manage users; reviewers get a focused full-screen panel of
their own.

This YSWS is currently a draft, and logins may be paused due to airtable (database limits)

## Features

- **Hack Club OAuth login**, with a signed, tamper-proof session cookie (HMAC-SHA256)
- **Hackatime integration** — connecting an account pulls in tracked projects and hours,
  which gate access to project submission
- **Projects** — name, description, code/demo/readme links, a screenshot upload, an AI
  usage disclosure, and a linked Hackatime project; owner-only visibility
- **Shop** — admin-managed items priced in barks, a per-user "Featured" pin (up to 3
  items), a Buy button that greys out when the user can't afford it, and an
  admin-only disable toggle that pulls an item from the shop without deleting it
- **Roles** — `user`, `admin`, `banned`, and `reviewer`, enforced server-side on every
  Server Action, not just hidden in the UI
- **Admin panel** — tabbed Shop / Projects / Review / Leaderboard / Users management,
  with an expandable detail row per user (Hackatime status, verification, login
  history, an admin-only internal note) and per project
- **Reviewer panel** — a dedicated full-screen view (no sidebar) at `/reviewer` for
  anyone with the reviewer role

## Stack

| Layer | Tech | Role |
|-------|------|------|
| Framework | Next.js (App Router), React | Server Components, Server Actions, Route Handlers |
| Data | Airtable REST API | The only datastore — three tables: Shop Items, Users, Projects |
| Auth | Hack Club OAuth + Hackatime OAuth | Identity and tracked-time data |
| Avatars | Slack Web API | Profile pictures, via a bot token |
| Styling | Tailwind CSS + hand-written CSS | `app/globals.css` carries the site's own component classes |

> **Heads up:** this repo pins a Next.js version newer than what most tooling/training
> data expects. Check `node_modules/next/dist/docs/` for anything that looks
> unfamiliar before assuming a pattern from an older Next.js still applies — see
> `AGENTS.md`.

## Development setup

```bash
git clone https://github.com/siddharthan-pradeep07/wild-ysws
cd wild-ysws

npm install
cp .env.local.example .env.local   # fill in every value below
npm run dev                         # runs on :3000
```

## Environment variables (`.env.local`)

```bash
# Hack Club OAuth (auth.hackclub.com)
HACKCLUB_CLIENT_ID=
HACKCLUB_CLIENT_SECRET=
HACKCLUB_REDIRECT_URI=http://localhost:3000/auth/callback

# Bootstrap admins — comma-separated emails, invisible allowlist,
# doesn't depend on Airtable being reachable
ADMIN_EMAILS=

# Session cookie signing (any long random string)
SESSION_SECRET=

# Airtable — one base, three tables (see schema below)
AIRTABLE_TOKEN=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=            # Shop Items table
AIRTABLE_USERS_TABLE_NAME=      # Users table
AIRTABLE_PROJECTS_TABLE_NAME=   # Projects table

# Slack (for avatars only — needs the users:read scope)
SLACK_BOT_TOKEN=

# Hackatime OAuth (hackatime.hackclub.com)
HACKATIME_CLIENT_ID=
HACKATIME_CLIENT_SECRET=
HACKATIME_REDIRECT_URI=http://localhost:3000/api/hackatime/callback
```

## Airtable schema

Three tables in one base. Field names are read exactly as written below —
Airtable field names are case-sensitive over the API.

**Shop Items** (`AIRTABLE_TABLE_NAME`)

| Field | Type |
|---|---|
| `Name` | Single line text |
| `Description` | Long text |
| `Price` | Number |
| `Image URL` | Single line text |
| `fulfill` | Single line text |
| `Order` | Number — drives admin drag-to-reorder |
| `Disabled` | Checkbox |

**Users** (`AIRTABLE_USERS_TABLE_NAME`)

| Field | Type |
|---|---|
| `Name`, `Email`, `Slack ID` | Single line text |
| `Role` | Single select — `user`, `admin`, `reviewer`, `banned` |
| `User ID` | Single line text — Hack Club's OAuth `sub` |
| `Verification Status`, `YSWS Eligible` | Text / Checkbox — from Hack Club OAuth |
| `Hackatime Connected`, `Hackatime Connected At` | Checkbox / Date |
| `Hackatime Projects` | Long text — JSON snapshot of tracked projects + hours |
| `Featured Items` | Long text — JSON list of up to 3 pinned shop item IDs |
| `barks` | Number — the currency balance |
| `Last Login`, `Login Count` | Date / Number |
| `Internal Note` | Long text — admin-only, never shown to the user |

**Projects** (`AIRTABLE_PROJECTS_TABLE_NAME`)

| Field | Type |
|---|---|
| `Name`, `Description` | Text |
| `Code URL`, `Demo URL`, `Readme URL` | Single line text |
| `Screenshot` | Attachment |
| `AI Usage` | Long text |
| `Project Type` | Single select — see `PROJECT_TYPES` in `lib/projects.ts` |
| `Hackatime Project` | Single line text |
| `Owner Email`, `Owner Name` | Single line text |

## Roles

| Role | Grants |
|---|---|
| `user` | Default. Shop, own projects (once Hackatime is connected) |
| `admin` | Everything a user has, plus `/admin` — Shop/Projects/Review/Leaderboard/Users management |
| `reviewer` | The full-screen `/reviewer` panel (Review + Leaderboard tabs) |
| `banned` | Blocked from submitting or editing projects, with a message pointing them to an admin |

-----

Every check is re-verified server-side inside the Server Action itself — Server
Actions are reachable via a direct POST regardless of what the UI renders, so
authorization never relies on a button simply not being shown.

-----
