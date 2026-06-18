# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Plain HTML/CSS/JS — no build step, no framework, no dependencies. Open `index.html` directly in a browser to develop.

## Files

- `index.html` — single-page layout; all sections are here
- `style.css` — all styles; uses CSS custom properties defined in `:root`
- `script.js` — scroll behavior, mobile nav, scroll-reveal, contact form

## Key patterns

**CSS variables** — colors, spacing, and font are all in `:root`. Change them there, not scattered through the file.

**Scroll reveal** — `script.js` adds `.reveal` to a set of selectors at load, then an `IntersectionObserver` adds `.visible` when they enter the viewport. To make a new element animate in on scroll, add its selector to the `revealTargets` array in `script.js`.

**Contact form** — uses [Formspree](https://formspree.io). The form `action` in `index.html` currently has a placeholder `YOUR_FORM_ID`. To activate it: sign up at formspree.io, create a form, and replace `YOUR_FORM_ID` with the real ID (e.g. `xpzvwkqr`). The JS in `script.js` submits via `fetch` and handles success/error states without a page reload.

**Mobile nav** — the hamburger button toggles `.open` on both itself and `#navLinks`. Clicking any nav link closes the menu.

## Content

All content is hardcoded in `index.html`. The owner is **Aditya Vikram Singh**.
- Email: singhav@appstate.edu
- GitHub: https://github.com/saddict/
- LinkedIn: https://www.linkedin.com/in/aditya-vikram-singh-7247a7209
