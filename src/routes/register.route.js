const express =require('express')
const {registerStudent}=require('../controllers/register.controller')
const router = express.Router()

router.post('/student/register', registerStudent);

module.exports=router