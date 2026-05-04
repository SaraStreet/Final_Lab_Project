const express = require('express');
const router = express.Router();
 
// Validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 1;
 
/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} str - The string to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
 
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
 
/**
 * Validate comment form data
 * @param {object} data - Data to validate
 * @returns {object} - { valid: boolean, errors: array }
 */
function validateComment(data) {
  const errors = [];
 
  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  } else if (data.name.length > MAX_NAME_LENGTH) {
    errors.push(`Name must be less than ${MAX_NAME_LENGTH} characters`);
  }
 
  // Validate email
  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else if (data.email.length > MAX_EMAIL_LENGTH) {
    errors.push(`Email is too long`);
  } else if (!isValidEmail(data.email.trim())) {
    errors.push('Please enter a valid email address');
  }
 
  // Validate message
  if (!data.message || data.message.trim() === '') {
    errors.push('Comment cannot be empty');
  } else if (data.message.trim().length < MIN_MESSAGE_LENGTH) {
    errors.push('Comment must contain at least one character');
  } else if (data.message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Comment must be less than ${MAX_MESSAGE_LENGTH} characters (you provided ${data.message.length})`);
  }
 
  return {
    valid: errors.length === 0,
    errors: errors
  };
}
 
// POST - Create a new comment
router.post('/', function(req, res, next) {
  try {
    const { name, email, message } = req.body;
 
    // Validate input
    const validation = validateComment({ name, email, message });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }
 
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedMessage = sanitizeInput(message);
 
    // Insert into database
    req.db.query(
      'INSERT INTO comments (name, email, message, created_at) VALUES (?, ?, ?, NOW())',
      [sanitizedName, sanitizedEmail, sanitizedMessage],
      (err, results) => {
        if (err) {
          console.error('Error inserting comment:', err);
          return res.status(500).json({
            success: false,
            errors: ['Unable to save comment. Please try again later.']
          });
        }
 
        // Fetch the newly created comment
        req.db.query(
          'SELECT id, name, email, message, created_at FROM comments WHERE id = ?',
          [results.insertId],
          (err, comments) => {
            if (err) {
              console.error('Error fetching new comment:', err);
              return res.status(500).json({
                success: false,
                errors: ['Comment saved, but could not retrieve it.']
              });
            }
 
            res.json({
              success: true,
              comment: comments[0]
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      errors: ['An unexpected error occurred. Please try again.']
    });
  }
});
 
// GET - Fetch comments with pagination
router.get('/', function(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
 
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters'
      });
    }
 
    // Get total count
    req.db.query('SELECT COUNT(*) as total FROM comments', (err, countResults) => {
      if (err) {
        console.error('Error counting comments:', err);
        return res.status(500).json({
          success: false,
          error: 'Unable to fetch comments'
        });
      }
 
      const total = countResults[0].total;
      const totalPages = Math.ceil(total / limit);
 
      // Get paginated comments
      req.db.query(
        'SELECT id, name, email, message, created_at FROM comments ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, results) => {
          if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({
              success: false,
              error: 'Unable to fetch comments'
            });
          }
 
          res.json({
            success: true,
            comments: results,
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              total: total,
              limit: limit
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});
 
module.exports = router;