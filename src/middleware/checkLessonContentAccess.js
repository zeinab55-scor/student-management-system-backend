
const Course = require('../models/courses.model');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');
const Enrollment = require('../models/enrollment.model');
const Lesson = require('../models/leason.model');

const checkLessonContentAccess = async (req, res, next) => {
  try {
    let courseId = req.params.courseId;
    let lesson = null;

    // When accessing a specific lesson
    if (req.params.id) {
      lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      courseId = lesson.course;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Admin can access all lesson content
    if (req.user.role === 'admin') {
      req.course = course;
      req.lesson = lesson;
      return next();
    }

    // Teacher can access lessons only in assigned courses
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher profile not found'
        });
      }

      const isAssigned = course.teachers.some(
        id => id.toString() === teacher._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this course'
        });
      }

      req.course = course;
      req.lesson = lesson;
      return next();
    }

    // Student must be enrolled in the course
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      const enrollment = await Enrollment.findOne({
        student: student._id,
        course: course._id,
        status: { $in: ['active', 'completed'] }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Please enroll in this course to access its lessons'
        });
      }

      req.course = course;
      req.lesson = lesson;
      req.enrollment = enrollment;

      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = checkLessonContentAccess;
