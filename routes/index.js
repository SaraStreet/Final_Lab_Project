const express = require('express');
const router = express.Router();

// GET landing page
router.get('/', function(req, res, next) {
  try {
    res.render('pages/home', { 
      title: 'Downtown Donuts - Fresh Donuts & Coffee Since 1992',
      page: 'home'
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).send('Error loading home page');
  }
});

// GET menu page
router.get('/menu', function(req, res, next) {
  try {
    res.render('pages/menu', { 
      title: 'Our Menu - Downtown Donuts',
      page: 'menu'
    });
  } catch (error) {
    console.error('Error loading menu page:', error);
    res.status(500).send('Error loading menu page');
  }
});

// GET about page
router.get('/about', function(req, res, next) {
  try {
    res.render('pages/about', { 
      title: 'About Us - Downtown Donuts',
      page: 'about'
    });
  } catch (error) {
    console.error('Error loading about page:', error);
    res.status(500).send('Error loading about page');
  }
});

// GET comments page
router.get('/comments', function(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const commentsPerPage = 10;
    const offset = (page - 1) * commentsPerPage;

    // Get total count
    req.db.query('SELECT COUNT(*) as total FROM comments', (err, countResults) => {
      if (err) {
        console.error('Error counting comments:', err);
        return res.render('pages/comments', {
          title: 'Customer Comments - Downtown Donuts',
          page: 'comments',
          comments: [],
          currentPage: 1,
          totalPages: 1,
          error: 'Unable to load comments at this time'
        });
      }

      const totalComments = countResults[0].total;
      const totalPages = Math.ceil(totalComments / commentsPerPage);

      // Get paginated comments
      req.db.query(
        'SELECT * FROM comments ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [commentsPerPage, offset],
        (err, results) => {
          if (err) {
            console.error('Error fetching comments:', err);
            return res.render('pages/comments', {
              title: 'Customer Comments - Downtown Donuts',
              page: 'comments',
              comments: [],
              currentPage: page,
              totalPages: totalPages,
              error: 'Unable to load comments at this time'
            });
          }

          res.render('pages/comments', {
            title: 'Customer Comments - Downtown Donuts',
            page: 'comments',
            comments: results,
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          });
        }
      );
    });
  } catch (error) {
    console.error('Error loading comments page:', error);
    res.status(500).send('Error loading comments page');
  }
});

module.exports = router;