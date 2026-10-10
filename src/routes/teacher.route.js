const express = require('express')
const router = express.Router()
const { createTeacher  ,
     editTeacherById,getTeachers,getTeacherById
    ,editTeacherStatus ,getTeacherDashboardStats
    ,getMyTeacherProfile,updateMyTeacherProfile
}= require("../controllers/teacher.controller")
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
 
 router.post('/admin',authMiddleware,roleMiddleware('admin'),createTeacher)
router.put('/admin/:id',authMiddleware,roleMiddleware('admin'),editTeacherById)
router.get('/getteachers',authMiddleware,roleMiddleware('admin','student'),getTeachers)
router.get('/getteacher/:id',authMiddleware,roleMiddleware('admin','student'),getTeacherById)
router.patch('/admin/:id/status',authMiddleware,roleMiddleware('admin'),editTeacherStatus)
 router.get(
  '/dashboard/stats',
  authMiddleware,
  roleMiddleware('teacher'),
  getTeacherDashboardStats
);

router.get(
  '/me/profile',
  authMiddleware,
  roleMiddleware('teacher'),
  getMyTeacherProfile
);

router.put(
  '/me/profile',
  authMiddleware,
  roleMiddleware('teacher'),
  updateMyTeacherProfile
);

module.exports = router