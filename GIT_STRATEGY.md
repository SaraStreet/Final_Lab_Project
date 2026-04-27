# Git Strategy — Downtown Donuts

## Branch Structure

```
main
├── feature/project-setup        → initial scaffold, package.json, server.js
├── feature/html-pages           → all four HTML pages + nav
├── feature/hand-written-css     → style.css (complete)
├── feature/comments-api         → routes/comments.js (backend)
├── feature/comments-frontend    → public/js/comments.js (frontend)
├── feature/menu-tabs            → public/js/menu.js
├── feature/accessibility        → ARIA roles, skip links, keyboard nav
└── feature/edge-cases-docs      → README edge cases + final polish
```

## Suggested Commit Sequence (≥ 15 commits, spread across ≥ 3 days)

### Day 1 — Setup & Structure
```
git checkout -b feature/project-setup
git add package.json server.js
git commit -m "Initialize Express project with helmet, morgan, and static middleware"

git add data/comments.json
git commit -m "Add seed comment data for local development"

git checkout main && git merge feature/project-setup
```

### Day 2 — Pages & Styling
```
git checkout -b feature/html-pages
git add public/index.html
git commit -m "Add landing page with hero section and feature cards"

git add public/menu.html
git commit -m "Add menu page with tab panel structure for donuts/coffee/seasonal"

git add public/about.html
git commit -m "Add About Us page with timeline and values grid"

git add public/comments.html public/404.html
git commit -m "Add comments page layout and 404 error page"

git checkout main && git merge feature/html-pages

git checkout -b feature/hand-written-css
git add public/css/style.css
git commit -m "Add base CSS: reset, variables, typography, and layout helpers"

git add public/css/style.css   # after adding nav + button styles
git commit -m "Add nav, button, and hero component styles"

git add public/css/style.css   # after adding page-specific styles
git commit -m "Add menu cards, about split layout, and comments form styles"

git add public/css/style.css   # after adding media queries
git commit -m "Add responsive media queries for tablet and mobile breakpoints"

git checkout main && git merge feature/hand-written-css
```

### Day 3 — Backend & Full-Stack
```
git checkout -b feature/comments-api
git add routes/comments.js
git commit -m "Add GET /api/comments with pagination (10 per page, newest first)"

git add routes/comments.js   # after adding POST
git commit -m "Add POST /api/comments with server-side validation and XSS sanitization"

git add routes/comments.js   # after adding idempotency
git commit -m "Add idempotency key check to prevent double-submit on POST"

git checkout main && git merge feature/comments-api
```

### Day 4 — Frontend JS & Accessibility
```
git checkout -b feature/comments-frontend
git add public/js/comments.js
git commit -m "Add comments.js: fetch comments, render cards, handle pagination"

git add public/js/comments.js   # after adding submit + edge cases
git commit -m "Add comment submission with double-submit guard and friendly error messages"

git checkout main && git merge feature/comments-frontend

git checkout -b feature/menu-tabs
git add public/js/menu.js public/js/nav.js
git commit -m "Add menu tab switching with ARIA roles and arrow-key keyboard navigation"

git checkout main && git merge feature/menu-tabs

git checkout -b feature/accessibility
# (edit HTML files to add/verify skip links, ARIA, labels)
git commit -m "Add skip-to-content links and verify all form inputs have associated labels"
git commit -m "Audit semantic HTML: replace div wrappers with nav, main, article, footer"

git checkout main && git merge feature/accessibility
```

### Day 5 — Polish & Docs
```
git checkout -b feature/edge-cases-docs
git add README.md
git commit -m "Write README: setup instructions, design decisions, edge cases, citations"

git checkout main && git merge feature/edge-cases-docs
git commit -m "Final review: verify checklist, clean up console.logs"
```

## Tips for Authentic History
- Make commits as you complete each piece of work — not at the end
- If you edit a file after a commit, commit the change separately with a
  message like "Fix mobile nav z-index on comments page"
- Branches show the grader you thought about your workflow intentionally
