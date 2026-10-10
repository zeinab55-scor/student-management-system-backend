const User = require('../models/user.model')
const bcrypt= require('bcrypt')
const Teacher= require('../models/teacher.model')
const Course = require('../models/courses.model');
const Enrollment = require('../models/enrollment.model');
const Lesson = require('../models/leason.model');
const Progress = require('../models/progress.model');

const createTeacher = async (req, res ,next) => {
  try {
    const {
      teacherId,firstName,lastName,email,
      password,phone,age,address,
      specialization,qualification,
      experienceYears
    } = req.body;

    if (
      !teacherId || !firstName || !lastName ||
      !email || !password || !phone ||
      !age ||  !address || !specialization 
      
    ) {
      return res.status(400).json({ success: false,message: 'Please provide all required fields'});
    }

    const existingUser = await User.findOne({
      $or: [  { email }, { phone } ]
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email or phone already exists'});
    }

    const existingTeacher = await Teacher.findOne({teacherId});

    if (existingTeacher) {
      return res.status(409).json({  success: false,message: 'Teacher ID already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,lastName,email,
      password: hashedPassword,
      phone,age,address,
      role: 'teacher'
    });

    const newTeacher = await Teacher.create({
      user: newUser._id,
      teacherId,specialization,
      qualification,
      experienceYears
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: {
        id: newTeacher._id,
        teacherId: newTeacher.teacherId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        specialization: newTeacher.specialization
      }
    });

  } catch (error) {
   next(error) ;
  }
};
 
const getTeachers =async (req,res,next)=>{
  try {
    const teachers = await Teacher.find().populate('user','-password')
    res.status(200).json({success:true,count:teachers.length,teachers})
  } catch (error) {
    next(error)
  }
}
 
const getTeacherById=async (req,res,next)=>{
  try {
    const {id}=req.params 
    const teacher=await Teacher.findById(id).populate('user','-password')
    if(!teacher){
      return res.status(404).json({success: false,message: 'Teacher not found'});

    }
    res.status(200).json({success:true,teacher})
  } catch (error) {
    next(error)
  }
}
 
const editTeacherById=async (req,res,next)=>{
  try {
    const {id}=req.params 
    const {teacherId,firstName,lastName,email,
      phone,age,address,
      specialization,qualification,
      experienceYears
    }=req.body 
    const teacher =await Teacher.findById(id)
    if (!teacher){
      return res.status(404).json({success:false , message:'Teacher not found'})
    }
    const user = await User.findById(teacher.user)
    if(!user){
      return res.status(404).json({success:false,message:'User data not found'})
    }
    if (firstName !== undefined) user.firstName=firstName;
    if (lastName !== undefined) user.lastName=lastName;
    if (email !== undefined) user.email=email;
    if (phone !== undefined) user.phone=phone;
    if (age !== undefined) user.age = age;
    if (address !== undefined) user.address = address;

    // Update Student data
    if (teacherId !== undefined) teacher.teacherId = teacherId;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (specialization !== undefined) teacher.specialization = specialization;
    if (experienceYears !== undefined) teacher.experienceYears = experienceYears;
 
    await user.save()
    await teacher.save()
    const updatedTeacher = await Teacher.findById(id).populate('user','-password')

    res.status(200).json({success:true,message:'Teacher updated successfuly',teacher:updatedTeacher})
  } catch (error) {
    next(error)
  }
}
const editTeacherStatus = async (req,res,next)=>{
  try {
    const {id}=req.params 
    const {status}=req.body 
    if(!status){
      return res.status(400).json({success:false,message:'Status is required'})
    }
    if(!['active','inactive'].includes(status)){
      return res.status(400).json({success:false,message:'Status must be active or inactive'})

    }
    
    const teacher = await Teacher.findById(id)
    if(!teacher){
      return res.status(404).json({success:false,message:'Teacher not found'})
    }
    const user = await User.findById(teacher.user)
    if(!user){
      return res.status(404).json({success:false,message:'User not found'})
    }
    user.status=status
    await user.save();
    res.status(200).json({success:true,message:`Teacher status changed to ${status} successfuly`,status:user.status})

  } catch (error) {
    next(error)
  }
}
 

const getTeacherDashboardStats = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({
      user: req.user.id
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    const courses = await Course.find({
      teachers: teacher._id
    }).select('courseName courseCode status').lean();

    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const [
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          totalLessons
        ] = await Promise.all([
          Enrollment.countDocuments({
            course: course._id,
            status: { $in: ['active', 'completed'] }
          }),
          Enrollment.countDocuments({
            course: course._id,
            status: 'active'
          }),
          Enrollment.countDocuments({
            course: course._id,
            status: 'completed'
          }),
          Lesson.countDocuments({ course: course._id })
        ]);

        return {
          courseId: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          status: course.status,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          totalLessons
        };
      })
    );

    const totalStudents = await Enrollment.distinct('student', {
      course: { $in: courses.map((course) => course._id) },
      status: { $in: ['active', 'completed'] }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalCourses: courses.length,
        activeCourses: courses.filter(
          (course) => course.status === 'active'
        ).length,
        totalStudents: totalStudents.length,
        totalEnrollments: courseStats.reduce(
          (sum, course) => sum + course.totalEnrollments,
          0
        )
      },
      courses: courseStats
    });
  } catch (error) {
    next(error);
  }
};


const getMyTeacherProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id })
      .select('-__v')
      .populate(
        'user',
        'firstName lastName email phone age address status role'
      );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.status(200).json({
      success: true,
      teacher
    });
  } catch (error) {
    next(error);
  }
};

const updateMyTeacherProfile = async (req, res, next) => {
  try {
    const allowedUserFields = [
      'firstName',
      'lastName',
      'phone',
      'age',
      'address'
    ];

    const allowedTeacherFields = [
      'specialization',
      'qualification',
      'experienceYears'
    ];

    const userUpdates = {};
    const teacherUpdates = {};

    for (const field of allowedUserFields) {
      if (req.body[field] !== undefined) {
        userUpdates[field] = req.body[field];
      }
    }

    for (const field of allowedTeacherFields) {
      if (req.body[field] !== undefined) {
        teacherUpdates[field] = req.body[field];
      }
    }

    if (
      Object.keys(userUpdates).length === 0 &&
      Object.keys(teacherUpdates).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No valid profile fields provided'
      });
    }

    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $set: userUpdates },
        { runValidators: true }
      );
    }

    if (Object.keys(teacherUpdates).length > 0) {
      Object.assign(teacher, teacherUpdates);
      await teacher.save();
    }

    const updatedTeacher = await Teacher.findById(teacher._id)
      .select('-__v')
      .populate(
        'user',
        'firstName lastName email phone age address status role'
      );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      teacher: updatedTeacher
    });
  } catch (error) {
    next(error);
  }
};

module.exports ={createTeacher, 
  getTeachers,getTeacherById ,editTeacherById
,editTeacherStatus,getTeacherDashboardStats,
getMyTeacherProfile,updateMyTeacherProfile}