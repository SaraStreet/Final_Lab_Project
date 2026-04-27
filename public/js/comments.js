/**
 * comments.js — Full client-side logic for the Comments page
 *
 * Responsibilities:
 *  1. Fetch and render paginated comments from GET /api/comments
 *  2. Submit new comments via POST /api/comments with client-side pre-validation
 *  3. Idempotency key — prevents double-submit on rapid button clicks
 *  4. Live character counters with visual warning near the limit
 *  5. Friendly error messages for every failure mode (server down, validation
 *     errors, network timeout, whitespace-only input)
 *  6. ARIA live regions keep screen readers in sync
 */
(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────────────────────────────── */
  const commentsList  = document.getElementById('comments-list');
  const loadingEl     = document.getElementById('loading');
  const pagination    = document.getElementById('pagination');
  const btnPrev       = document.getElementById('btn-prev');
  const btnNext       = document.getElementById('btn-next');
  const pageInfo      = document.getElementById('page-info');
  const serverErrorEl = document.getElementById('server-error');
  const feedbackEl    = document.getElementById('form-feedback');
  const submitBtn     = document.getElementById('submit-btn');
  const nameInput     = document.getElementById('name');
  const commentInput  = document.getElementById('comment');
  const nameCount     = document.getElementById('name-hint');
  const commentCount  = document.getElementById('comment-hint');

  let currentPage = 1;
  let isSubmitting = false; // double-submit guard flag

  /* ── Utilities ────────────────────────────────────────────────────────────── */

  /** Generate a UUID v4-like string for idempotency keys (no crypto needed) */
  function generateKey() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  /** Show feedback banner */
  function showFeedback(message, type) {
    feedbackEl.textContent = message;
    feedbackEl.className = 'form-feedback show ' + type;
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Auto-dismiss success after 6 s
    if (type === 'success') {
      setTimeout(function () { feedbackEl.classList.remove('show'); }, 6000);
    }
  }

  /** Show/hide the server error banner */
  function setServerError(visible) {
    serverErrorEl.classList.toggle('show', visible);
  }

  /** Build a single comment card element */
  function buildCard(c) {
    const article = document.createElement('article');
    article.className = 'comment-card';
    article.setAttribute('aria-label', 'Comment by ' + c.name);

    const header = document.createElement('div');
    header.className = 'comment-card__header';

    const name = document.createElement('p');
    name.className = 'comment-card__name';
    name.textContent = c.name;

    const time = document.createElement('time');
    time.className = 'comment-card__time';
    time.setAttribute('datetime', c.timestamp);
    time.setAttribute('title', c.formattedDate);
    time.textContent = c.relativeTime;

    header.append(name, time);

    const text = document.createElement('p');
    text.className = 'comment-card__text';
    // c.comment is already server-side escaped; use textContent so the browser
    // renders the escaped entities correctly without double-escaping.
    text.textContent = c.comment;

    article.append(header, text);
    return article;
  }

  /* ── Fetch & Render Comments ─────────────────────────────────────────────── */

  async function loadComments(page) {
    loadingEl.style.display = 'block';
    commentsList.innerHTML  = '';
    pagination.hidden       = true;
    setServerError(false);

    try {
      const res = await fetch('/api/comments?page=' + page);

      // Non-2xx → treat as server error
      if (!res.ok) throw new Error('Server returned ' + res.status);

      const data = await res.json();

      loadingEl.style.display = 'none';

      if (!data.comments.length) {
        commentsList.innerHTML = '<p style="color:var(--gray-text); font-style:italic;">No comments yet. Be the first!</p>';
        return;
      }

      // Render cards
      const fragment = document.createDocumentFragment();
      data.comments.forEach(function (c) { fragment.appendChild(buildCard(c)); });
      commentsList.appendChild(fragment);

      // Update pagination
      const p = data.pagination;
      if (p.totalPages > 1) {
        pagination.hidden = false;
        btnPrev.disabled  = !p.hasPrev;
        btnNext.disabled  = !p.hasNext;
        pageInfo.textContent = 'Page ' + p.currentPage + ' of ' + p.totalPages
          + ' (' + p.totalComments + ' comments)';
      }
      currentPage = p.currentPage;

    } catch (err) {
      loadingEl.style.display = 'none';
      setServerError(true);
      console.error('Failed to load comments:', err);
    }
  }

  /* ── Pagination Controls ─────────────────────────────────────────────────── */

  btnPrev.addEventListener('click', function () { loadComments(currentPage - 1); });
  btnNext.addEventListener('click', function () { loadComments(currentPage + 1); });

  /* ── Character Counters ──────────────────────────────────────────────────── */

  function updateCounter(input, counter, max) {
    const len = input.value.length;
    counter.textContent = len + ' / ' + max;
    counter.classList.toggle('warn', len > max * 0.85);
  }

  nameInput.addEventListener('input', function () { updateCounter(nameInput, nameCount, 60); });
  commentInput.addEventListener('input', function () { updateCounter(commentInput, commentCount, 500); });

  /* ── Submit Handler ──────────────────────────────────────────────────────── */

  submitBtn.addEventListener('click', async function () {

    /* ── 1. Double-submit guard ──────────────────────────────────────────── */
    if (isSubmitting) return;

    const name    = nameInput.value;
    const comment = commentInput.value;

    /* ── 2. Client-side pre-validation (mirrors server rules) ────────────── */
    // Whitespace-only check
    if (!name.trim()) {
      showFeedback('Please enter your name.', 'error');
      nameInput.focus();
      return;
    }
    if (!comment.trim()) {
      showFeedback('Your comment cannot be empty or contain only spaces.', 'error');
      commentInput.focus();
      return;
    }
    // Oversized input (belt-and-suspenders — input[maxlength] also enforces this)
    if (name.trim().length > 60) {
      showFeedback('Name must be 60 characters or fewer.', 'error');
      nameInput.focus();
      return;
    }
    if (comment.trim().length > 500) {
      showFeedback('Comment must be 500 characters or fewer.', 'error');
      commentInput.focus();
      return;
    }

    /* ── 3. Lock UI ──────────────────────────────────────────────────────── */
    isSubmitting = true;
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Posting…';
    feedbackEl.classList.remove('show');
    setServerError(false);

    /* ── 4. Generate idempotency key to prevent double-POST ─────────────── */
    const idempotencyKey = generateKey();

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, comment, idempotencyKey }),
      });

      const data = await res.json();

      if (res.ok) {
        /* ── Success: prepend new card, reset form ── */
        const newCard = buildCard(data.comment);
        commentsList.prepend(newCard);

        nameInput.value    = '';
        commentInput.value = '';
        nameCount.textContent    = '0 / 60';
        commentCount.textContent = '0 / 500';
        showFeedback('✓ Your comment has been posted. Thank you!', 'success');

      } else if (res.status === 422) {
        /* ── Validation errors from server ── */
        const messages = data.errors.join(' ');
        showFeedback(messages, 'error');

      } else if (res.status === 409) {
        /* ── Duplicate submission detected ── */
        showFeedback('It looks like that comment was already submitted.', 'error');

      } else {
        /* ── Other server error ── */
        showFeedback('Something went wrong on our end. Please try again.', 'error');
      }

    } catch (err) {
      /* ── Network / server unreachable ── */
      setServerError(true);
      showFeedback('Unable to reach the server. Please check your connection.', 'error');
      console.error('Submit error:', err);
    } finally {
      /* ── Always re-enable the button ── */
      isSubmitting           = false;
      submitBtn.disabled     = false;
      submitBtn.textContent  = 'Post Comment';
    }
  });

  /* ── Initial load ───────────────────────────────────────────────────────── */
  loadComments(1);

})();
