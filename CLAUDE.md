# cal-views

A React app that shows upcoming weekends from Google Calendar at a glance. Displays the next 12 weekends as a horizontal scrollable carousel, with events from Google Calendar API visualized per day.

## Stack

- **React 19** with functional components and hooks only (no class components, no Redux)
- **Vite 7** — dev server and build tool
- **Tailwind CSS 3** — all styling; no CSS-in-JS
- **dayjs** — all date manipulation
- **Google Identity Services** — browser-based OAuth 2.0
- **Google Calendar API v3** — fetched directly via `fetch()` with Bearer token

## Dev Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → /dist
npm run lint       # ESLint
npm run preview    # preview production build locally
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your Google OAuth client ID:

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

Never commit `.env` — it is gitignored.

## Project Structure

```
src/
  components/
    LoginScreen.jsx      # Google sign-in button UI
    WeekendStrip.jsx     # Horizontal scrollable carousel container
    WeekendCard.jsx      # Individual weekend card (Sat + Sun)
  hooks/
    useGoogleAuth.js     # Google OAuth flow and token management
    useCalendarEvents.js # Fetches events from Google Calendar API
  App.jsx                # Root component, owns auth state
  main.jsx               # React DOM entry point
```

## Conventions

- **Components**: PascalCase files, functional only, hooks for all logic
- **Hooks**: camelCase, prefixed with `use`, live in `src/hooks/`
- **Styling**: Tailwind utility classes exclusively; avoid inline styles except where Tailwind can't cover it (e.g. `scrollbarWidth: 'none'`)
- **API calls**: bare `fetch()` — no axios or other HTTP libraries
- **Dates**: always use `dayjs`; avoid native `Date` manipulation
- **State**: local `useState`/`useReducer` only; no global state library
- **No test framework** is currently set up

## Key Gotchas

- The Google client ID must be set in `.env` as `VITE_GOOGLE_CLIENT_ID` — Vite will not expose env vars without the `VITE_` prefix
- Google Identity Services loads via a `<script>` tag in `index.html`, not npm — the `google` global is available at runtime
- Tailwind purges unused styles at build time based on `./index.html` and `./src/**/*.{js,jsx}` — don't use dynamic class names that Tailwind can't statically detect
