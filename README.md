# Downtown Donuts Website

A modern, responsive full-stack website for Downtown Donuts, a family-owned donut and coffee shop. This project demonstrates design skills, technical proficiency, and full-stack development capabilities.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Edge Cases](#edge-cases)
- [Challenges & Learnings](#challenges--learnings)
- [Accessibility](#accessibility)
- [Citations](#citations)

## 🎯 Project Overview

Downtown Donuts needed a modern website prototype to showcase their business online. The goal was to create a custom-built site that reflects their cozy, minimal, modern aesthetic while being fully functional and mobile-responsive.

The site features:
- **Landing Page** - First impression with hero section and key info
- **Menu Page** - Full menu with donuts, coffee, and food items  
- **About Us Page** - Story of the business since 1992
- **Customer Comments** - Full-stack comment system with pagination

## ✨ Features

### User-Facing Features
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- **Hand-Written CSS** - No frameworks; pure custom CSS with Flexbox and Grid
- **Modern Aesthetic** - Follows provided brand guidelines exactly
- **Online Ordering Links** - Direct links to UberEats, DoorDash, and GrubHub
- **Hamburger Navigation** - Mobile-friendly menu toggle
- **Comment System** - Full-stack comment posting and display

### Technical Features
- **Server-Side Validation** - All user input validated on the server
- **XSS Prevention** - Input sanitization to prevent malicious scripts
- **Pagination** - Comments page with next/previous functionality
- **Timestamps** - Comments display relative time (e.g., "2 hours ago")
- **Error Handling** - Meaningful error messages for all failure scenarios
- **Keyboard Navigation** - Full keyboard support for all interactive elements
- **Accessibility** - Semantic HTML, alt text, ARIA labels, high contrast

## 🛠 Tech Stack

**Frontend:**
- HTML5 (semantic markup)
- CSS3 (Flexbox, Grid, media queries)
- JavaScript (vanilla, no frameworks)
- Pug templating engine

**Backend:**
- Node.js
- Express.js (web framework)
- MySQL (database)
- Nodemon (development)

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (included with Node.js)
- MySQL server running locally or remotely
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd downtown-donuts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   mysql -u root -p < setup_scripts/create_demo_table.sql
   ```

4. **Configure database connection** (if needed)
   - Edit `bin/db.js` and update the connection configuration

5. **Start the development server**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`

### Pages
- Home: `http://localhost:3000/`
- Menu: `http://localhost:3000/menu`
- About: `http://localhost:3000/about`
- Comments: `http://localhost:3000/comments`

## 📁 Project Structure

```
downtown-donuts/
├── public/
│   ├── stylesheets/
│   │   ├── style.css           # Main styles
│   │   ├── navigation.css      # Navigation styles
│   │   └── responsive.css      # Mobile breakpoints
│   ├── javascripts/
│   │   ├── navigation.js       # Menu handling
│   │   └── comments.js         # Form handler
│   └── images/
├── views/
│   ├── layout.pug              # Main template
│   └── pages/
│       ├── home.pug
│       ├── menu.pug
│       ├── about.pug
│       └── comments.pug
├── routes/
│   ├── index.js                # Page routes
│   └── comments.js             # API routes
├── bin/
│   ├── www
│   └── db.js
├── setup_scripts/
│   └── create_demo_table.sql
├── app.js
├── package.json
└── README.md
```

## 🎨 Design Decisions

### 1. **Brand Adherence & Color Palette**
Strictly followed the provided brand guidelines with Dark Green (#10291D), Saffron Gold (#F7C64A), and Seasalt (#F7F7F7). This creates the cozy, minimal aesthetic the client requested while maintaining professional appearance and accessibility.

### 2. **Hand-Written CSS Without Frameworks**
Built all styles from scratch using Flexbox and Grid instead of Bootstrap or Tailwind. This demonstrates deep understanding of CSS layout systems and responsive design principles. Organized with comprehensive comments for maintainability.

### 3. **Semantic HTML with Accessibility**
Used semantic HTML5 elements (`<nav>`, `<main>`, `<article>`) and proper ARIA labels. This improves SEO, helps screen readers understand structure, and follows web standards.

### 4. **Mobile-First Responsive Design**
Built mobile layouts first (single column, touch-friendly), then enhanced with breakpoints for tablet (768px) and desktop (1024px). Ensures perfect functionality on all devices.

### 5. **Full-Stack Comment System**
Built custom comment functionality with server-side validation, XSS prevention, and pagination. Demonstrates full-stack skills and maintains complete control over data privacy and functionality.

## 🛡️ Edge Cases

### 1. Empty or Whitespace-Only Comments
**Handling:** Server validates that `message.trim()` is not empty. Shows error: "Comment cannot be empty".

### 2. Extremely Long Input (10,000+ characters)
**Handling:** Textarea limited to 1000 characters. Server validates and rejects oversized submissions with clear message showing character count.

### 3. Double-Click Submit
**Handling:** Submit button disabled after click with "Posting..." text. Prevents race conditions and duplicate submissions.

### 4. Database Connection Failure
**Handling:** Returns friendly error message: "Unable to save comment..." instead of raw error codes. Actual error logged server-side for debugging.

### 5. Invalid Email Format
**Handling:** Server validates email format with regex. Rejects invalid emails with message: "Please enter a valid email address".

### 6. XSS Attack (Script Injection)
**Handling:** All inputs sanitized using HTML entity encoding (`<` → `&lt;`, etc.). Stored as plain text and HTML-escaped when displayed.

### 7. Network Timeout
**Handling:** Fetch request error caught and displays: "Unable to post comment. Please check your connection and try again."

### 8. SQL Injection Attempt
**Handling:** All queries use parameterized statements. User input treated as data, not SQL code. Database driver handles escaping automatically.

### 9. Empty Comments Page
**Handling:** Shows friendly message: "Be the first to share your Downtown Donuts experience!" Form remains visible to encourage first comment.

### 10. Server Error During Fetch
**Handling:** Checks both `response.ok` and `result.success`. Form not cleared on error so user can retry without losing data.

## 🚧 Challenges & Learnings

### Challenge 1: CSS Layout Without Frameworks
**Problem:** Creating responsive navigation without Bootstrap was complex. Hamburger menu needed to hide on desktop, show on mobile, maintain keyboard accessibility.

**Solution:** Used JavaScript class toggles (`hamburger.active`) with CSS transitions. Media queries at 768px hide hamburger and show full menu on desktop. Added keyboard event listeners for arrow key navigation.

**Learning:** Pure CSS solutions are elegant but JavaScript provides necessary control for complex interactions. Always prioritize accessibility alongside functionality.

### Challenge 2: Form Validation on Client AND Server
**Problem:** Validation logic was duplicated, risking inconsistency between client and server rules.

**Solution:** Created explicit validation function in both client and server that could be mirrored. Each rule documented with reasoning (max 100 chars for name, email regex, 1-1000 char message). Server returns messages matching client expectations.

**Learning:** Server validation is non-negotiable security concern. Keep client and server validation synchronized and documented.

### Challenge 3: Timestamp Generation and Display
**Problem:** Comments needed relative time ("2 hours ago") but timestamps generated server-side. Client-side calculation depends on system clock accuracy.

**Solution:** Store exact MySQL TIMESTAMP on server (authoritative). Pass as ISO string to client. Use JavaScript helper to compute relative time on page load. Balances security, UX, and simplicity.

**Learning:** Server-side timestamps more trustworthy. Relative time calculation happens on client where page is viewed.

## ♿ Accessibility

### Keyboard Navigation
- **Tab** - Navigate through interactive elements
- **Enter** - Activate buttons and submit forms
- **Escape** - Close mobile menu
- **Arrow Keys** - Navigate menu items
- **Ctrl+Enter** / **Cmd+Enter** - Submit comment form

### Screen Readers
- All images have alt text or `alt=""` if decorative
- Form labels associated with inputs via `<label for="id">`
- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`)
- Time elements for timestamps

### Visual Design
- Color contrast exceeds WCAG standards
- No information by color alone
- Readable font sizes (minimum 14px mobile, 16px forms)
- Touch targets minimum 44x44 pixels

