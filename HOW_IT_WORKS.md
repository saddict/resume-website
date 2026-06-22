# How This Website Works (and How to Build One Like It)

## Overview

This is a single-page portfolio website with no frameworks and no build step. Every section lives in one `index.html` file. The backend is a Firebase-powered contact form, and the site includes a custom inline-script theme toggle for light and dark mode.

---

## The tech stack

| What | Tool | Why |
|------|------|-----|
| Page structure | Plain HTML (`index.html`) | Simple, no framework needed |
| Styling | Plain CSS (`style.css`) | Full control, no dependencies |
| Interactivity | Plain JS (`script.js`) | Nav, animations, contact form submission |
| Theme switching | Inline JS in `index.html` + CSS variables | Prevents theme flash and keeps the toggle independent of Firebase module loading |
| Hosting | Firebase Hosting | Free tier, fast CDN, custom domain support |
| Contact form backend | Firebase Callable Functions + Firestore | Server-side validation, rate limiting, and persistence |
| Email sending | Firebase Cloud Functions + nodemailer | Runs server-side so credentials stay private |

---

## How each piece works

### 1. The HTML (`index.html`)

The page is one long HTML file. Each section (About, Skills, Experience, etc.) is a `<section>` tag with an `id`:

```html
<section id="about" class="section"> ... </section>
<section id="skills" class="section section-alt"> ... </section>
```

The nav links are anchors pointing to those IDs (`href="#about"`, etc.), so clicking them scrolls to that section with no routing layer needed.

`section-alt` applies a slightly different background color to visually alternate sections.

`index.html` also contains two small inline scripts:

- One in `<head>` that sets `data-theme` before the page paints, so the site loads directly in the correct light or dark theme.
- One before `script.js` that controls the animated navbar toggle and keeps its state in sync with the current theme.

### 2. The CSS (`style.css`)

- CSS custom properties at `:root` define the shared design values.
- Dark theme variables live under `[data-theme="dark"]`.
- Flexbox and CSS Grid handle layouts like the navbar, skills grid, project cards, and contact section.
- Media queries at the bottom handle mobile behavior. The nav collapses to a hamburger menu below `768px`.
- The navbar theme toggle is a custom animated control driven by `aria-pressed` and CSS transitions.

### 3. The JavaScript (`script.js`)

`script.js` has three responsibilities:

**a) Nav scroll behavior**

```text
scroll event -> check window.scrollY -> toggle .scrolled on navbar
                                   -> find which section is in view
                                   -> add .active to matching nav link
```

**b) Scroll-reveal animations**

Elements like `.section-title`, `.project-card`, etc. get a `.reveal` class added by JS on load. An `IntersectionObserver` watches them and adds `.visible` when they enter the viewport, which triggers the CSS fade/slide transition.

**c) Contact form submission**

See the Contact Form section below.

### 4. The theme toggle (`index.html` + `style.css`)

The light/dark toggle is deliberately not initialized inside `script.js`.

Why? Because `script.js` imports Firebase modules. If those imports fail or load slowly, the contact form can be affected, but the theme toggle should still work immediately. So the theme logic lives in plain inline scripts:

```js
var saved = localStorage.getItem('theme');
var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', saved || system);
```

Then a second inline script:

- syncs the toggle button's `aria-pressed`
- updates `data-theme` on click
- saves the preference to `localStorage`
- follows system theme changes when no explicit preference is saved

The CSS watches:

- `[data-theme="dark"]` for site colors
- `.theme-toggle[aria-pressed="true"]` for the toggle animation

### 5. Firebase (`firebase-config.js`)

```js
import { initializeApp } from "...firebase-app.js";
import { getFirestore } from "...firebase-firestore.js";
import { getFunctions } from "...firebase-functions.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app);
```

The API keys in `firebaseConfig` are safe to expose publicly. Firebase security rules and server-side validation are what matter.

---

## The contact form - step by step

This is the most complex part. Here is what happens when someone clicks "Send Message":

```text
User fills out form
        |
        v
script.js checks:
  - Is the honeypot field empty?
  - Was the last submission more than 60 seconds ago?
  - Are all fields within length limits?
        |
        v
JS calls the callable Cloud Function "submitContact"
        |
        v
Cloud Function (functions/index.js):
  1. Validates all fields
  2. Looks up sender IP in Firestore "rate_limits"
     - 3+ messages in 24h -> reject
     - otherwise continue
  3. HTML-escapes user input
  4. Sends email via nodemailer/Gmail
  5. Stores the contact in Firestore "contacts"
        |
        v
Frontend shows success or error message
```

### Why call a Cloud Function instead of writing to Firestore directly?

The old browser -> Firestore -> trigger -> email approach is easy to bypass. Anyone who knows the Firebase project can try to hit Firestore directly. Calling a Cloud Function closes that gap because validation and rate limiting happen on the server side.

---

## How to build your own version

### Step 1 - Copy and edit the HTML

Clone or download the project. Open `index.html` and replace the content in each section with your own information. The base pattern is:

```html
<section id="sectionname" class="section">
    <div class="container">
        <h2 class="section-title">Section Title</h2>
        <!-- your content here -->
    </div>
</section>
```

### Step 2 - Adjust colors, fonts, and theme

In `style.css`, update the CSS variables in `:root`, then update the matching dark theme values under `[data-theme="dark"]`. Swap the Google Font link in `<head>` if you want a different typeface.

### Step 3 - Set up Firebase

1. Create a Firebase project in [console.firebase.google.com](https://console.firebase.google.com).
2. Enable Firestore Database.
3. Enable Hosting.
4. Enable Functions.
5. Install the Firebase CLI: `npm install -g firebase-tools`
6. Run `firebase login` and `firebase init`.
7. Replace the `firebaseConfig` object in `firebase-config.js` with your project's config.

### Step 4 - Store Gmail credentials securely

Use a Gmail App Password and store it in Firebase Functions config:

```bash
firebase functions:config:set gmail.email="your@gmail.com" gmail.password="your-app-password"
```

Update the destination address in `functions/index.js`.

### Step 5 - Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

### Step 6 - Deploy the site

```bash
firebase deploy
```

---

## Files you usually do not edit

- `functions/node_modules/` - auto-generated
- `functions/package-lock.json` - auto-generated
- `.firebase/` - local Firebase CLI cache
- `.firebaserc` - project ID mapping used by the Firebase CLI
