# cal-views

A React app that shows upcoming weekends from Google Calendar at a glance. Displays the next 12 weekends as a horizontal scrollable carousel, with events from all visible Google calendars visualized per day. Supports two view modes: schedule (event list) and calendar (time grid).

## Stack

- **React 19** with functional components and hooks only (no class components, no Redux)
- **Vite 7** — dev server and build tool
- **Tailwind CSS 3** — all styling via utility classes, dark mode via `class` strategy
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
    WeekendStrip.jsx     # Horizontal scrollable carousel container + state orchestration
    WeekendCard.jsx      # Schedule view: individual weekend card (Sat + Sun event list)
    WeekendCardGrid.jsx  # Calendar view: time-grid card with events positioned by time
    CalendarLegend.jsx   # Calendar color legend with toggle buttons
    ViewModeToggle.jsx   # Schedule / Calendar view mode switch
    ThemeToggle.jsx      # Light / System / Dark theme switch
  hooks/
    useGoogleAuth.js     # Google OAuth flow, token management, sessionStorage persistence
    useCalendarEvents.js # Fetches calendar list + events from all visible calendars
    useTheme.js          # Dark mode preference (localStorage) + system theme detection
  App.jsx                # Root component, owns auth state + theme
  main.jsx               # React DOM entry point
```

## Conventions

- **Components**: PascalCase files, functional only, hooks for all logic
- **Hooks**: camelCase, prefixed with `use`, live in `src/hooks/`
- **Styling**: Tailwind utility classes exclusively with `dark:` variants for dark mode; avoid inline styles except where Tailwind can't cover it (e.g. dynamic calendar colors, `scrollbarWidth: 'none'`)
- **API calls**: bare `fetch()` — no axios or other HTTP libraries
- **Dates**: always use `dayjs`; avoid native `Date` manipulation
- **State**: local `useState`/`useReducer` only; no global state library
- **Persistence**: `sessionStorage` for auth tokens, `localStorage` for user preferences (theme, view mode)
- **No test framework** is currently set up

## Key Gotchas

- The Google client ID must be set in `.env` as `VITE_GOOGLE_CLIENT_ID` — Vite will not expose env vars without the `VITE_` prefix
- Google Identity Services loads via a `<script>` tag dynamically in `useGoogleAuth`, not via npm — the `google` global is available at runtime
- Tailwind purges unused styles at build time based on `./index.html` and `./src/**/*.{js,jsx}` — don't use dynamic class names that Tailwind can't statically detect
- Dark mode uses `darkMode: 'class'` in Tailwind config — the `dark` class is toggled on `<html>` by `useTheme`
- Calendar event colors come from the Google Calendar API (`backgroundColor` on each calendar) and are applied via inline styles, not Tailwind classes
- Both view modes (schedule + calendar) must use the same card width (`w-96`) to avoid visual jumping when toggling
