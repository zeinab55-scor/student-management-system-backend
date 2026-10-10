 const User = require('../models/user.model')
 const Student = require('../models/student.model')
 const bcrypt= require('bcrypt');
 const Enrollment = require('../models/enrollment.model');
const Lesson = require('../models/leason.model');
const Progress = require('../models/progress.model');

 const createStudent =async (req,res,next)=>{
     try {
          const {studentId,firstName,lastName,email,password,phone,
       age,address, dateOfBirth, gender
     } = req.body;
      if (
       !studentId || !firstName || !lastName || !email ||
       !password || !phone || !age || !address) {
       return res.status(400).json({success: false,message: 'Please provide all required fields'});
     }
     const existingUser = await User.findOne({$or:[{email},{phone}]})
      if (existingUser) {
       return res.status(409).json({ success: false, message: 'Email or phone already exists'});
     }
  const existingStudent = await Student.findOne({ studentId});
 
     if (existingStudent) {
       return res.status(409).json({ success: false,  message: 'Student ID already exists'});
     }
 const hashedPassword = await bcrypt.hash(password, 10);
 
     const newUser = await User.create({
       firstName, lastName, email,
       password: hashedPassword,phone,age,
       address,role: 'student'
     });
 const newStudent = await Student.create({
       user: newUser._id,studentId,dateOfBirth,
       gender
     });
     res.status(201).json({success: true,message: 'Student created successfully',
       student: {
         id: newStudent._id,
         studentId: newStudent.studentId,
         firstName: newUser.firstName,
         lastName: newUser.lastName,
         email: newUser.email
       }
     });
     } catch (error) {
       next(error) 
     }
 }

const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .select('studentId user')
      .populate('user', 'firstName lastName email phone status');

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    next(error);
  }
};
 const getStudentById =async (req,res,next)=>{
     try {
         const {id}= req.params 
         const student = await Student.findById(id)
       .populate('user', '-password');
 
     if (!student) {
       return res.status(404).json({success: false,message: 'Student not found'});
     }
     res.status(200).json({ success: true,student});
     } catch (error) {
      next(error)
     }
 }

 const editStudentById=async (req,res,next)=>{
   try {
     const {id}=req.params 
     const {firstName,lastName,email,phone,age,address,
       studentId,dateOfBirth,gender
     }=req.body 
     const student =await Student.findById(id)
     if (!student){
       return res.status(404).json({success:false , message:'Student not found'})
     }
     const user = await User.findById(student.user)
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
     if (studentId !== undefined) student.studentId = studentId;
     if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
     if (gender !== undefined) student.gender = gender;
      
     await user.save()
     await student.save()
     const updatedStudent = await Student.findById(id).populate('user','-password')
 
     res.status(200).json({success:true,message:'Student updated successfuly',student:updatedStudent})
   } catch (error) {
     next(error)
   }
 }
 const editStudentStatus = async (req,res,next)=>{
   try {
     const {id}=req.params 
     const {status}=req.body 
     if(!status){
       return res.status(400).json({success:false,message:'Status is required'})
     }
     if(!['active','inactive'].includes(status)){
       return res.status(400).json({success:false,message:'Status must be active or inactive'})
 
     }
     
     const student = await Student.findById(id)
     if(!student){
       return res.status(404).json({success:false,message:'Student not found'})
     }
     const user = await User.findById(student.user)
     if(!user){
       return res.status(404).json({success:false,message:'User not found'})
     }
     user.status=status
     await user.save();
     res.status(200).json({success:true,message:`Student status changed to ${status} successfuly`,status:user.status})
 
   } catch (error) {
     next(error)
   }
 }
 
const getStudentDashboardStats = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const enrollments = await Enrollment.find({
      student: student._id,
      status: { $in: ['active', 'completed'] }
    }).populate('course');

    const courses = await Promise.all(
      enrollments
        .filter(enrollment => enrollment.course)
        .map(async enrollment => {
          const course = enrollment.course;

          const [totalLessons, completedLessons] = await Promise.all([
            Lesson.countDocuments({ course: course._id }),
            Progress.countDocuments({
              enrollment: enrollment._id,
              status: 'completed'
            })
          ]);

          const progressPercentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

          return {
            enrollmentId: enrollment._id,
            courseId: course._id,
            courseName: course.courseName,
            thumbnail: course.thumbnail,
            enrollmentStatus: enrollment.status,
            totalLessons,
            completedLessons,
            progressPercentage
          };
        })
    );

    const activeEnrollments = enrollments.filter(
      enrollment => enrollment.status === 'active'
    ).length;

    const completedEnrollments = enrollments.filter(
      enrollment => enrollment.status === 'completed'
    ).length;

    const totalCompletedLessons = courses.reduce(
      (total, course) => total + course.completedLessons,
      0
    );

    res.status(200).json({
      success: true,
      message: 'Student dashboard statistics retrieved successfully',
      stats: {
        totalCourses: enrollments.length,
        activeCourses: activeEnrollments,
        completedCourses: completedEnrollments,
        totalCompletedLessons,
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMyStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .select('-__v')
      .populate(
        'user',
        'firstName lastName email phone age address status role'
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    next(error);
  }
};

const updateMyStudentProfile = async (req, res, next) => {
  try {
    const allowedUserFields = [
      'firstName',
      'lastName',
      'phone',
      'age',
      'address'
    ];

    const allowedStudentFields = [
      'dateOfBirth',
      'gender'
    ];

    const userUpdates = {};
    const studentUpdates = {};

    for (const field of allowedUserFields) {
      if (req.body[field] !== undefined) {
        userUpdates[field] = req.body[field];
      }
    }

    for (const field of allowedStudentFields) {
      if (req.body[field] !== undefined) {
        studentUpdates[field] = req.body[field];
      }
    }

    if (
      Object.keys(userUpdates).length === 0 &&
      Object.keys(studentUpdates).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'No valid profile fields provided'
      });
    }

    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $set: userUpdates },
        { runValidators: true }
      );
    }

    if (Object.keys(studentUpdates).length > 0) {
      Object.assign(student, studentUpdates);
      await student.save();
    }

    const updatedStudent = await Student.findById(student._id)
      .select('-__v')
      .populate(
        'user',
        'firstName lastName email phone age address status role'
      );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

 module.exports={createStudent,getStudents,getStudentById
    ,editStudentById,editStudentStatus,getStudentDashboardStats
    ,getMyStudentProfile,updateMyStudentProfile
 }