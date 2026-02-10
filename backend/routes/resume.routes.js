const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticate = require('../middleware/auth');
const upload = require('../utils/multer');
const resumeController = require('../controllers/resume.controller');
const AppError = require('../utils/AppError');

const handleMulterError = (err, req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size exceeds 5MB limit', 400));
    }
    return next(new AppError(err.message, 400));
  }
  return next(new AppError(err.message || 'Invalid file', 400));
};

router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  handleMulterError,
  resumeController.uploadResume
);
router.post(
  '/match',
  authenticate,
  resumeController.matchResumeWithJD
);
router.post(
  '/analyze',
  authenticate,
  upload.single('file'),
  handleMulterError,
  resumeController.analyzeResume
);



module.exports = router;
