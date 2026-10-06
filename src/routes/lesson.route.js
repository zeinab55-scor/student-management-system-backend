const express = require('express');

const {
  createLesson,getLessonsByCourse
} = require('../controllers/lesson.controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'teacher'),
  createLesson
);
router.get('/course/:courseId',getLessonsByCourse)

module.exports = router;