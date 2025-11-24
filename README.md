# Employee Performance Evaluation System

> A lightweight web app for managing and evaluating employee performance. Built with Vite + TypeScript, Tailwind CSS, and Supabase for backend and database.

---

## Table of contents

* [About](#about)
* [Features](#features)
* [Tech stack](#tech-stack)
* [Prerequisites](#prerequisites)
* [Quick start](#quick-start)
* [Environment & configuration](#environment--configuration)
* [Project structure](#project-structure)
* [Database (Supabase)](#database-supabase)
* [Usage](#usage)
* [Testing](#testing)
* [Deployment](#deployment)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## About

This repository contains an Employee Performance Evaluation System — a web application that lets managers and HR create evaluation forms, submit employee reviews, and track performance over time. The app uses Supabase for authentication and data storage, a Vite + TypeScript frontend, and TailwindCSS for styling.

> **Note:** This README was created from the repository contents (TypeScript + Supabase configuration present). Adjust the configuration steps below if your environment differs.

## Features

* User authentication (Supabase)
* CRUD for employees and performance reviews
* Rating and comment fields per review
* Dashboard to view recent reviews and performance trends
* Responsive UI (Tailwind)

## Tech stack

* Frontend: Vite + TypeScript
* UI: Tailwind CSS
* Backend / Auth / DB: Supabase (Postgres)
* Misc: Vite, Bun/NPM lock files present

## Prerequisites

* Node.js (recommended 18+)
* npm or Yarn (or Bun if you prefer; repository contains `bun.lockb`)
* Supabase project (for production/dev backend)

## Quick start

1. Clone the repo

```bash
git clone https://github.com/khushiyadav24680-art/Employee-Performance-Evaluation-System-.git
cd Employee-Performance-Evaluation-System-
```

2. Install dependencies (npm example)

```bash
npm install
# or
# yarn
# or
# bun install
```

3. Create a `.env` file (see **Environment & configuration**)

4. Run the dev server

```bash
npm run dev
# or
# bun dev
```

Open `http://localhost:5173` (or the address printed by Vite) in your browser.

## Environment & configuration

The project uses Supabase for authentication and Postgres storage. Create a Supabase project at [https://app.supabase.com](https://app.supabase.com) and get the following values:

* `VITE_SUPABASE_URL` (Supabase project URL)
* `VITE_SUPABASE_ANON_KEY` (Anon/public API key)

Example `.env` (Vite-style `VITE_` prefix required):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

> If the repo contains additional env keys inside `src/` or `supabase` folder, mirror those in your `.env` file.

## Project structure

```
/ (root)
├─ src/                # Frontend source (TypeScript + components)
├─ supabase/           # SQL migrations / table definitions (if provided)
├─ index.html
├─ package.json
├─ bun.lockb
├─ tailwind.config.ts
└─ README.md           # (this file)
```

Adjust paths above if your repo uses a different layout.

## Database (Supabase)

The `supabase/` folder in the repo contains SQL or migration files (if present). To prepare your database:

1. In Supabase dashboard, create tables for `users`, `employees`, `reviews`, etc. — or run the SQL scripts from `supabase/` if included.
2. Ensure RLS policies allow authenticated users to read/write where appropriate (or disable RLS for development).
3. Seed any demo data if the repo includes seed SQL.

Typical tables:

* `employees` — id, name, department, position, hire_date, manager_id
* `reviews` — id, employee_id, reviewer_id, score, comments, created_at
* `users` — Supabase auth managed

## Usage

* Sign up / sign in using Supabase-auth provided flows.
* Create employees from the UI and add performance reviews.
* Use the dashboard to filter and view reviews.

If the frontend expects specific routes or components, open `src/` to find route names and adjust links accordingly.

## Testing

If tests exist (look for a `test` folder or tooling like Jest / Vitest), run:

```bash
npm test
# or
# npm run test:coverage
```

If the repo contains no tests yet, consider adding simple unit tests for core components and API calls.

## Deployment

You can deploy the app to Vercel, Netlify, or any static host that supports Vite-built apps.

Build the app:

```bash
npm run build
```

Then follow your host's instructions to serve the `dist/` or `build/` folder. Ensure the environment variables from the **Environment & configuration** section are set in your deployment platform.

## Contributing

Contributions are welcome! Steps to contribute:

1. Fork the repository
2. Create a branch for your change (`feat/`, `fix/`, `docs/`)
3. Make changes and add tests if applicable
4. Open a PR describing your change

Please follow the existing code style (TypeScript, Tailwind utility classes). If you want, open an issue first to discuss large changes.

## License

This project is licensed under the MIT License — see the included `LICENSE` file for details.

## Contact

If you want to reach the author/maintainer, open an issue on the GitHub repo or use the profile contact on GitHub.
