const Lesson = require('../models/leason.model');
const Course = require('../models/courses.model');

// ==================== Create Lesson ====================

const createLesson = async (req, res, next) => {
  try {
    const {
      course,
      title,
      description,
      videoUrl,
      pdfUrl,
      content,
      order,
      duration
    } = req.body;

    // Check required fields
    if (!course || !title || order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Course, title and order are required'
      });
    }

    // Check if course exists
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if lesson order already exists in this course
    const existingLesson = await Lesson.findOne({
      course,
      order
    });

    if (existingLesson) {
      return res.status(409).json({
        success: false,
        message: 'Lesson order already exists in this course'
      });
    }

    const lesson = await Lesson.create({
      course,
      title,
      description,
      videoUrl,
      pdfUrl,
      content,
      order,
      duration
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson
    });

  } catch (error) {
    next(error);
  }
};

const getLessonsByCourse =async (req,res,next)=>{
    try {
        const {courseId}=req.params 
        const course = await Course.findById(courseId)
        if(!course){
              return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
        }
        const lessons = await Lesson.find({course:courseId}).sort({order:1}) 
        res.status(200).json({success:true,count: lessons.length,lessons})
    } catch (error) {
        next(error)
    }
}
module.exports = {
  createLesson,getLessonsByCourse
};