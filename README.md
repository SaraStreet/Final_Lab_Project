# Downtown Donuts — CS208 Final Project

A prototype website for Downtown Donuts, a family-owned donut and coffee shop serving the downtown community since 1992.

---

## Setup Instructions

Follow these steps exactly. A classmate with no prior knowledge of this project should be able to run it after reading this section.

**Prerequisites:** Node.js v18+ and npm installed.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/downtown-donuts.git
cd downtown-donuts

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# For development with auto-reload:
npm run dev   # requires nodemon (installed as a dev dependency)

# 4. Open in your browser
# http://localhost:3000
```

The server runs on port 3000 by default. To change it, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

No database setup is required. Comments are stored in `data/comments.json`, which is created automatically if it does not exist.

---

## Design Decisions

### 1. Warm, earthy brand palette instead of generic white-and-brown

The client brief asked for a "cozy, minimal, modern" feel. Rather than reaching for a flat white background, I chose a warm cream (`#FAF5ED`) as the base color. This immediately evokes the warmth of a real bakery without adding visual noise. All colors were derived from the brand guidelines — deep espresso brown (`#3B2314`), dusty rose (`#D4756A`), and warm gold (`#C8953A`) — and defined as CSS custom properties so they are changed in one place and propagate everywhere.

### 2. Sticky, dark navigation bar

I made the `<nav>` sticky (it stays at the top while the user scrolls) and gave it the darkest brand color. This solves two problems at once: users always know how to navigate without scrolling back up, and the dark bar creates a strong visual anchor that frames the page. On mobile, the hamburger menu collapses all links and opens them in a fullscreen-width dropdown that is easy to tap.

### 3. No `<form>` element for comment submission

The client wants comments to appear on the page without a full reload. Instead of using a traditional HTML `<form>` (which triggers a page navigation on submit), the form is a plain `<div>` and the submit button fires a `fetch()` call to the API. This lets me insert the new comment card into the DOM immediately on success — a much better user experience. The tradeoff is that JavaScript must be available, which is a reasonable assumption for a modern web app.

### 4. Server-generated timestamps (never trust the client)

The `timestamp` field on every comment is set by the server at the moment the POST request is processed — never by the client. If timestamps came from the browser, a user could spoof any date they wanted. The server converts the ISO string to a human-readable relative time (`"2 hours ago"`) and sends it back to the client with the 201 response so it can be displayed immediately without a second request.

### 5. Flat-file JSON store instead of a database

For a prototype, spinning up a full database (SQLite, PostgreSQL, etc.) adds infrastructure overhead that slows down development and complicates the setup instructions. A simple JSON file works perfectly for this scale. The tradeoff is that concurrent writes could cause data loss in a high-traffic production environment — a real deployment would use a proper database.

---

## Edge Cases

| Scenario | How It's Handled |
|---|---|
| **Server / API unreachable** | Both `loadComments()` and the submit handler wrap their `fetch()` calls in `try/catch`. A network error surfaces the `#server-error` banner ("Unable to connect to the server…") and a red feedback message. The UI remains intact; no raw error codes or stack traces are shown to the user. |
| **Whitespace-only comment** | Client-side: `name.trim()` and `comment.trim()` are checked before the request is sent; an error message is shown and focus is moved to the offending field. Server-side: `express-validator`'s `.trim().notEmpty()` chain rejects the request with a 422 and a descriptive error array even if the client-side check was bypassed. |
| **Extremely long input (10,000 chars)** | The `<input>` and `<textarea>` elements carry `maxlength` attributes (60 and 500 respectively), so browsers won't let users type past the limit in the normal UI. If a request is crafted manually, the server validator enforces `.isLength({ max })` and returns a 422. The character counter turns red when the user approaches the limit (85% of max) to warn them proactively. |
| **Rapid double-click on Submit** | An `isSubmitting` boolean is set to `true` the instant the button is clicked. The handler returns immediately if it is already `true`. The button is also visually disabled (`submitBtn.disabled = true`) and its label changes to "Posting…" so there is a clear UI signal. The `isSubmitting` flag and button state are always reset in the `finally` block. The server also maintains an in-memory idempotency key set: a POST that carries the same key as a previous request within 60 seconds returns 409 Conflict. |

---

## Challenges & Learnings

### Challenge 1: Idempotent comment submission without a database

I wanted to prevent duplicate comments if a user clicked Submit quickly or the network was slow and they retried. The naive solution is to just disable the button — but that fails if the user opens two tabs. My solution uses two layers: a client-side `isSubmitting` flag (fast, covers the common case) and a server-side in-memory `Set` of idempotency keys (covers multi-tab and crafted requests). Each request generates a UUID that is only used once; the server rejects duplicates with HTTP 409.

What I tried first: I initially tried to detect duplicates by checking for identical `name` + `comment` + timestamp on the server, but timestamps are only accurate to the second, which still allowed duplicates under fast clicks. The idempotency key approach is more robust.

### Challenge 2: Keeping ARIA live regions useful without being noisy

Screen readers announce the content of `aria-live` regions whenever they change. I initially set `aria-live="polite"` on the entire comments list — which caused the reader to announce every single comment card on page load. I fixed this by moving the `aria-live` attribute only to the elements that represent true status changes (the loading indicator and the feedback banner), and used `aria-label` on the list itself so it has a meaningful name without re-announcing its content constantly.

---

## Citations

| Resource | Used For |
|---|---|
| MDN Web Docs — [ARIA: tabpanel role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tabpanel_role) | Implementing keyboard-navigable tabs on the Menu page |
| MDN Web Docs — [Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | Fetch-based form submission and error handling |
| express-validator documentation — [https://express-validator.github.io](https://express-validator.github.io) | Server-side validation chain syntax |
| CSS-Tricks — [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) | Flexbox layout reference |
| CSS-Tricks — [A Complete Guide to CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/) | Grid layout reference |
| WCAG 2.1 Quick Reference — [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/) | Accessibility standards reference |
| Google Fonts — Playfair Display + DM Sans | Typography |

> All code was written by hand. No AI was used to generate the CSS, JavaScript, or HTML.
