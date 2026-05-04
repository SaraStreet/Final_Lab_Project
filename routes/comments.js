const express = require('express');
const router = express.Router();

/* POST a new comment */
router.post('/', function(req, res, next) {
  // This is where your server will eventually save the comment to a database
  console.log("Received data:", req.body);
  
  res.json({ success: true, message: "Comment received!" });
});

module.exports = router;