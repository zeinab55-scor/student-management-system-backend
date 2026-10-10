const express = require('express');

const {
  createCourse,getAllCourses,getCourseById,updateCourseById,editCourseStatus
} = require('../controllers/course.controller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/admin',authMiddleware,roleMiddleware('admin'),createCourse);
router.get('/',getAllCourses);
router.get('/getcourse/:id',getCourseById)
router.put('/admin/:id',authMiddleware,roleMiddleware('admin'),updateCourseById)
router.patch('/admin/:id/status',authMiddleware,roleMiddleware('admin'),editCourseStatus)
module.exports = router;