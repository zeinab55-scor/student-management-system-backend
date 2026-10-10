
const express = require('express');

const {
  completeLesson,getMyProgress,getCourseLessonsProgress,
  updateLessonProgress,getStudentCourseProgress
} = require('../controllers/progress.controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post(
  '/lessons/:lessonId/complete',
  authMiddleware,
  roleMiddleware('student'),
  completeLesson
);
router.get(
  '/my-courses',
  authMiddleware,
  roleMiddleware('student'),
  getMyProgress
);
router.get(
  '/courses/:courseId/lessons',
  authMiddleware,
  roleMiddleware('student'),
  getCourseLessonsProgress
);
router.patch(
  '/lessons/:lessonId',
  authMiddleware,
  roleMiddleware('student'),
  updateLessonProgress
);
router.get(
  '/students/:studentId/courses/:courseId',
  authMiddleware,
  roleMiddleware('admin', 'teacher'),
  getStudentCourseProgress
);
module.exports = router;
