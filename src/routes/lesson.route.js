
const express = require('express');

const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  editLessonById,
  deleteLessonById
} = require('../controllers/lesson.controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const checkTeacherCourseAccess = require('../middleware/teacherCourseMiddleware');
const checkLessonContentAccess =require('../middleware/checkLessonContentAccess')

const router = express.Router();

// Create lesson
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin', 'teacher'),
  checkTeacherCourseAccess,
  createLesson
);

// Public lesson routes

router.get(
  '/course/:courseId',
  authMiddleware,
  roleMiddleware('admin', 'teacher', 'student'),
  checkLessonContentAccess,
  getLessonsByCourse
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'teacher', 'student'),
  checkLessonContentAccess,
  getLessonById
);

// Edit lesson
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'teacher'),
  checkTeacherCourseAccess,
  editLessonById
);

// Delete lesson
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin', 'teacher'),
  checkTeacherCourseAccess,
  deleteLessonById
);

module.exports = router;
