const express = require('express');

const {
  enrollInCourse,getMyCourses,getEnrollmentById
} = require('../controllers/enrollment.controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  roleMiddleware('student'),
  enrollInCourse
);
router.get('/my-courses',authMiddleware,roleMiddleware('student'),getMyCourses)
router.get('/:id',authMiddleware,roleMiddleware('student','admin'),getEnrollmentById)
module.exports = router;