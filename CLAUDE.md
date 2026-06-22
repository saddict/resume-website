# Portfolio Website - Claude Context

## What this project is

Personal portfolio site for Aditya Vikram Singh. Plain HTML/CSS/JS frontend, no build step or framework. Hosted on Firebase Hosting with a callable Firebase Function-backed contact form and a Cloud Function that sends email via nodemailer.

## File map

| File | Purpose |
|------|---------|
| `index.html` | All page content plus the inline theme bootstrapping script and non-module theme toggle logic |
| `style.css` | All styling - CSS custom properties at `:root`, responsive media queries, dark theme variables, animated navbar toggle, dedicated project badge colors |
| `script.js` | Nav scroll behavior, scroll-reveal animations, contact form submit handler |
| `firebase-config.js` | Firebase SDK init (public API keys, safe to commit) - exports `db`, `analytics`, and `functions` |
| `firestore.rules` | Security rules for the `contacts` collection |
| `functions/index.js` | Callable Cloud Function `submitContact` - validates, rate-limits, emails via Gmail/nodemailer, then stores the contact |
| `functions/package.json` | Cloud Function dependencies: `firebase-admin`, `firebase-functions`, `nodemailer` |
| `firebase.json` | Firebase project config - hosting root is `.`, functions source is `functions/` |
| `.firebaserc` | Links project to Firebase project ID `resume-website-445c0` |

## Theme flow

1. Inline `<head>` script reads `localStorage.theme` or system preference and sets `data-theme` on `<html>` before paint.
2. Navbar toggle button (`#themeToggle`) is rendered in `index.html`.
3. Inline script before `script.js` keeps the toggle's `aria-pressed` state in sync, persists theme changes, and follows system theme changes when no saved preference exists.
4. `style.css` switches site colors using `[data-theme="dark"]` variables and animates the custom toggle via `aria-pressed`.
5. Project badges use dedicated `--badge-bg` and `--badge-text` variables so labels like "Hackathon Winner" stay balanced in dark mode.

## Contact form flow

1. User submits form -> `script.js` validates honeypot, 60s client cooldown, and field lengths.
2. JS calls HTTPS callable Cloud Function `submitContact` via `httpsCallable`.
3. Cloud Function:
   - Validates all fields (types, lengths, email regex)
   - Checks IP-based rate limit in `rate_limits/{ip}` Firestore doc (max 3 per 24h, via Firestore transaction)
   - If over limit, throws `resource-exhausted` so the user sees "try again tomorrow"
   - Sends email to `saditya495@gmail.com` via Gmail/nodemailer (HTML-escaped)
   - Stores contact in `contacts` collection using Admin SDK
4. Frontend shows success or error message.

Gmail credentials are stored in Firebase Functions config, not in code:

```bash
firebase functions:config:set gmail.email="..." gmail.password="..."
```

## Deploy commands

```bash
# Deploy everything (hosting + functions + firestore rules)
firebase deploy

# Deploy only the static site
firebase deploy --only hosting

# Deploy only the Cloud Function
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

## Security measures in place

- Honeypot: hidden `name="website"` input; bots fill it, humans do not.
- Client-side cooldown: `SUBMIT_COOLDOWN_MS = 60_000`; server still enforces the real limit.
- Server-side IP rate limit: Cloud Function enforces max 3 submissions per IP per 24 hours using a Firestore transaction on `rate_limits/{sanitized_ip}`.
- Field validation in Cloud Function: type checks, length limits (`name <= 100`, `email <= 200`, `message <= 2000`), email regex.
- HTML escaping: `escapeHtml()` in `functions/index.js` prevents HTML injection in the received email.
- Firestore locked down: only the Cloud Function should write contact records.
- `maxlength` attributes: inputs enforce limits in the browser UI.

## Key conventions

- Google Fonts (Inter) loaded via `<link>` in `<head>` - no local font files.
- Firebase JS SDK loaded from CDN (`gstatic.com`) as ES modules - no npm for the frontend.
- `script.js` uses ES module `import` - `index.html` loads it with `<script type="module">`.
- Theme toggle logic intentionally lives in a plain inline `<script>` in `index.html`, not in `script.js`, so the toggle still works if the Firebase module fails to initialize.
- Scroll-reveal uses `IntersectionObserver` - elements get `.reveal` class added by JS, `.visible` when they enter the viewport.
- Responsive nav: hamburger button toggles `.open` on both itself and `#navLinks`.
- Active nav link: set by scroll position in the `scroll` event listener.
