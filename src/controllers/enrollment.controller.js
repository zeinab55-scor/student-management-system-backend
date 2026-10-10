const Enrollment = require('../models/enrollment.model')
const Student = require('../models/student.model')
const Course = require('../models/courses.model');
const { Error } = require('mongoose');

const enrollInCourse = async (req, res, next) => {
  try {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({
        success: false,
        message: 'Course is required'
      });
    }

    const student = await Student.findOne({
      user: req.user.id
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (existingCourse.status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'Course is inactive'
      });
    }

const existingEnrollment = await Enrollment.findOne({
  student: student._id,
  course
});

if (existingEnrollment) {
  if (existingEnrollment.status !== 'cancelled') {
    return res.status(409).json({
      success: false,
      message: 'Student is already enrolled in this course'
    });
  }

  existingEnrollment.status = 'active';
  existingEnrollment.enrolledAt = new Date();

  await existingEnrollment.save();

  const updatedEnrollment = await Enrollment.findById(
    existingEnrollment._id
  )
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .populate(
      'course',
      'courseCode courseName category level price'
    );

  return res.status(200).json({
    success: true,
    message: 'Student enrolled again successfully',
    enrollment: updatedEnrollment
  });
}

const enrollment = await Enrollment.create({
  student: student._id,
  course
});


    const createdEnrollment = await Enrollment.findById(
      enrollment._id
    )
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .populate(
        'course',
        'courseCode courseName category level price'
      );

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      enrollment: createdEnrollment
    });

  } catch (error) {
    next(error);
  }
};

const getMyCourses = async (req,res,next)=>{
    try {
        const student = await Student.findOne({
            user:req.user.id
        })
        if(!student){
            return res.status(404).json({success:false,message:'Student profile not found'})
        }
        const enrollment = await Enrollment.find({student:student._id}).populate('course','courseCode courseName description category level language price thumbbail duration status')
        .sort({enrolledAt:-1})
        res.status(200).json({success:true,count:enrollment.length,courses:enrollment})
        
    } catch (error) {
        next(error)
    }
}

const getEnrollmentById = async (req,res,next)=>{
    try {
        const {id}=req.params 
        const enrollment = await Enrollment.findById(id).populate({
            path:'student',
            populate:{
                path:'user',
                select:'firstName lastName email'
            }
        }).populate('course','courseCode courseName description category level price status')
        if(!enrollment){
            return res.status(404).json({success:false,message:'Enrollment not found'})
            
        }
        const isAdmin = req.user.role === 'admin'
        const isOwner = enrollment.student.user._id.toString() === req.user.id;
            if(!isAdmin && !isOwner){
            return res.status(403).json({success:false,message:'Access denied'})

            }
            return res.status(200).json({success:true,enrollment})

    } catch (error) {
        next(error)
    }
}
module.exports = {
  enrollInCourse,getMyCourses,getEnrollmentById
};
