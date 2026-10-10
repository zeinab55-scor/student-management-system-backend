const Lesson = require('../models/leason.model');
const Course = require('../models/courses.model');
const { Error } = require('mongoose');

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

const getLessonById = async (req,res,next)=>{
  try {
    const {id} = req.params
    const lesson = await Lesson.findById(id).populate('course','courseCode courseName')
    if(!lesson){
      return res.status(404).json({success:false,message:"Lesson not found"})
    }
    res.status(200).json({success:true,lesson})
  } catch (error) {
    next(error)
  }
}

const editLessonById =async (req,res,next)=>{
  try {
    const {id}=req.params 
    const { title,
      description,
      videoUrl,
      pdfUrl,
      content,
      order,
      duration}=req.body
      const lesson = await Lesson.findById(id)
      if(!lesson){
        return res.status(404).json({success:false,message:'Lesson not found'})
      }
       if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (pdfUrl !== undefined) lesson.pdfUrl = pdfUrl;
    if (content !== undefined) lesson.content = content;
    if (duration !== undefined) lesson.duration = duration;

    if (order !== undefined && order !== lesson.order){
      const existingLesson = await Lesson.findOne({
         course: lesson.course,
        order,
        _id: { $ne: id }
      })

      if(existingLesson){
        return res.status(409).json({success:false,message:'Lesson order already in this course '})
      }
      lesson.order=order
    }
    await lesson.save()
     res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    next(error)
  }
}

const deleteLessonById =async (req,res,next)=>{
  try {
    const {id}=req.params
    const lesson = await Lesson.findByIdAndDelete(id)
    if(!lesson){
      return res.status(404).json({success:false,message:'Lesson not found'})
    }
    res.status(200).json({success:true,message:'Lesson deleted succefuly'})
  } catch (error) {
    next(error)
  }
}
module.exports = {
  createLesson,getLessonsByCourse,getLessonById,editLessonById
  ,deleteLessonById
};