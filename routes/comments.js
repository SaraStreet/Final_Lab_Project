const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/comments.json');
const PAGE_SIZE = 10;
const MAX_NAME_LENGTH = 60;
const MAX_COMMENT_LENGTH = 500;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Load comments from the JSON flat-file store */
function loadComments() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/** Persist comments to the JSON flat-file store */
function saveComments(comments) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(comments, null, 2), 'utf8');
}

/**
 * Minimal XSS sanitizer — escapes the five HTML metacharacters.
 * This runs server-side so even a malicious client payload is neutralised
 * before it ever reaches the data store or another visitor's browser.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Format an ISO timestamp as a human-readable relative string */
function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)    return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12)  return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`;
}

// ── Validation Middleware ─────────────────────────────────────────────────────

const validateComment = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: MAX_NAME_LENGTH })
    .withMessage(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment cannot be empty.')
    .isLength({ max: MAX_COMMENT_LENGTH })
    .withMessage(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.`),
];

// ── Double-submit guard (in-memory token store) ───────────────────────────────
// Each POST must include a client-generated idempotency key; duplicate keys
// within the same server process are rejected with 409 Conflict.
const usedKeys = new Set();

// ── GET /api/comments?page=1 ─────────────────────────────────────────────────
router.get('/', (req, res) => {
  const comments = loadComments();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const totalComments = comments.length;
  const totalPages = Math.max(1, Math.ceil(totalComments / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // Newest first
  const sorted = [...comments].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  const slice = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Attach relative time for display
  const withRelative = slice.map(c => ({
    ...c,
    relativeTime: relativeTime(c.timestamp),
    formattedDate: new Date(c.timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
  }));

  res.json({
    comments: withRelative,
    pagination: {
      currentPage: safePage,
      totalPages,
      totalComments,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  });
});

// ── POST /api/comments ────────────────────────────────────────────────────────
router.post('/', validateComment, (req, res) => {
  // Validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map(e => e.msg) });
  }

  // Idempotency / double-submit protection
  const idempotencyKey = req.body.idempotencyKey;
  if (idempotencyKey) {
    if (usedKeys.has(idempotencyKey)) {
      return res.status(409).json({ errors: ['Duplicate submission detected.'] });
    }
    usedKeys.add(idempotencyKey);
    // Evict after 60 s so memory doesn't grow forever
    setTimeout(() => usedKeys.delete(idempotencyKey), 60_000);
  }

  // Sanitize & store
  const newComment = {
    id: uuidv4(),
    name: escapeHtml(req.body.name.trim()),
    comment: escapeHtml(req.body.comment.trim()),
    timestamp: new Date().toISOString(), // server-side timestamp — client cannot spoof this
  };

  const comments = loadComments();
  comments.push(newComment);
  saveComments(comments);

  return res.status(201).json({
    comment: {
      ...newComment,
      relativeTime: relativeTime(newComment.timestamp),
      formattedDate: new Date(newComment.timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
    },
  });
});

module.exports = router;
