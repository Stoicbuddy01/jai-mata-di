const express = require('express');
const router = express.Router();
const resumeRoutes = require('./resume.routes');
const authenticate = require("../middleware/auth");


router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get("/protected", authenticate, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});


router.use('/api/resume', resumeRoutes);

module.exports = router;
