const express=require("express")
const dotenv=require("dotenv")
const cors=require("cors")
const connectDB = require('./src/config/db')
const registerRoutes = require('./src/routes/register.route')
const loginRoutes = require('./src/routes/login.route')
const adminRoutes =require('./src/routes/admin.route')
const studentRoutes =require('./src/routes/student.route')
const errorMiddleware =require("./src/middleware/errorMiddlewarw")
const courseRoutes =require('./src/routes/courses.route')
const teacherRoutes =require('./src/routes/teacher.route')
const lessonsRoutes = require('./src/routes/lesson.route')
const enrollmentRoutes = require('./src/routes/enrollment.route')
const progressRoutes=require('./src/routes/progress.route')

dotenv.config();
const app =express()
app.use(cors())
app.use(express.json())
 
connectDB();

app.use('/api/auth',registerRoutes)
app.use('/api/auth', loginRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teachers',teacherRoutes)
app.use('/api/lessons',lessonsRoutes)
app.use('/api/enrollments',enrollmentRoutes)
app.use('/api/progress',progressRoutes)

app.get('/api/health',(req,res)=>{
    res.json({success:true,message:"Student Mangement API is running"})
})

app.use(errorMiddleware)

const PORT=process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})