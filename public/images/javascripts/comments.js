/**
 * Comments Form Handler
 * Manages comment submission, validation, and display
 * Includes error handling and character counter
 */

document.addEventListener('DOMContentLoaded', function() {
  const commentForm = document.getElementById('comment-form');
  const submitBtn = document.getElementById('submit-btn');
  const messageField = document.getElementById('message');
  const charCount = document.getElementById('char-count');
  const formErrors = document.getElementById('form-errors');
  const formSuccess = document.getElementById('form-success');

  // Character counter
  if (messageField && charCount) {
    messageField.addEventListener('input', function() {
      charCount.textContent = this.value.length;
      
      // Change color as user approaches limit
      if (this.value.length > 900) {
        charCount.parentElement.style.color = '#F7C64A';
      } else if (this.value.length > 950) {
        charCount.parentElement.style.color = '#c33';
      } else {
        charCount.parentElement.style.color = '#999999';
      }
    });
  }

  // Form submission
  if (commentForm) {
    commentForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Hide previous messages
      formErrors.style.display = 'none';
      formSuccess.style.display = 'none';

      // Disable submit button
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Posting...';

      try {
        // Get form data
        const formData = new FormData(commentForm);
        const data = {
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message')
        };

        // Send request
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          // Handle validation or server errors
          showErrors(result.errors || ['An error occurred. Please try again.']);
        } else {
          // Success
          showSuccess();
          commentForm.reset();
          charCount.textContent = '0';
          
          // Reload comments after a short delay
          setTimeout(function() {
            location.reload();
          }, 1500);
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
        showErrors(['Unable to post comment. Please check your connection and try again.']);
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  /**
   * Display validation errors
   * @param {Array} errors - Array of error messages
   */
  function showErrors(errors) {
    formErrors.innerHTML = '<ul>' + 
      errors.map(error => `<li>${escapeHtml(error)}</li>`).join('') + 
      '</ul>';
    formErrors.style.display = 'block';
    formErrors.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Display success message
   */
  function showSuccess() {
    formSuccess.style.display = 'block';
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Prevent double submission with rapid clicks
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {
      if (this.disabled) {
        return false;
      }
    });
  }

  // Keyboard support for form submission
  commentForm.addEventListener('keydown', function(event) {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      if (!submitBtn.disabled) {
        submitBtn.click();
      }
    }
  });
});