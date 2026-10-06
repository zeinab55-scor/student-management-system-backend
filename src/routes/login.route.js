const express = require('express')
const router = express.Router()

const { login,changePassword,getMe } = require('../controllers/login.controller')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/login', login)
router.put('/change-password',authMiddleware,changePassword);
router.get('/me',authMiddleware,getMe)
module.exports = router