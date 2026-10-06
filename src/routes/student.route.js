const express = require('express');
const router = express.Router();

 const {createStudent,getStudentById,getStudents,editStudentById,editStudentStatus}=require('../controllers/student.controller')
 const authMiddleware =require('../middleware/authMiddleware')
 const roleMiddleware =require('../middleware/roleMiddleware')
 
 router.post('/admin/create',authMiddleware,roleMiddleware('admin'),createStudent)
 router.get('/getstudents',authMiddleware,roleMiddleware('admin','teacher'),getStudents);
router.get( '/getstudent/:id', authMiddleware,  roleMiddleware('admin','teacher'), getStudentById);
router.put('/editstudent/:id',authMiddleware,roleMiddleware('admin','teacher'),editStudentById)
 router.patch('/admin/:id/status',authMiddleware,roleMiddleware('admin'),editStudentStatus)

module.exports = router;