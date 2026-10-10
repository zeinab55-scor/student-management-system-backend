
const express = require('express');

 const {getDashboardStats,getCoursesStats,
    getAllStudentsPaginated,getAllTeachersPaginated,
    getAllCoursesForAdmin,getAllEnrollments,getCourseEnrollments,
    updateEnrollmentStatus}=require('../controllers/admin.controller')
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
 
const router = express.Router();

 
 
router.get(
  '/dashboard/stats',
  authMiddleware,
  roleMiddleware('admin'),
  getDashboardStats
);

router.get(
  '/dashboard/courses-stats',
  authMiddleware,
  roleMiddleware('admin'),
  getCoursesStats
);
router.get(
  '/students/search',
  authMiddleware,
  roleMiddleware('admin'),
  getAllStudentsPaginated
);
router.get(
  '/teachers/search',
  authMiddleware,
  roleMiddleware('admin'),
  getAllTeachersPaginated
);
router.get(
  '/courses',
  authMiddleware,
  roleMiddleware('admin'),
  getAllCoursesForAdmin
);

router.get(
  '/enrollments',
  authMiddleware,
  roleMiddleware('admin'),
  getAllEnrollments
);

router.get(
  '/courses/:courseId/enrollments',
  authMiddleware,
  roleMiddleware('admin'),
  getCourseEnrollments
);

router.patch(
  '/enrollments/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  updateEnrollmentStatus
);

module.exports = router;

