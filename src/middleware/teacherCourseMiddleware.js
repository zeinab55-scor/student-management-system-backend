
const Course = require('../models/courses.model');
const Teacher = require('../models/teacher.model');
const Lesson = require('../models/leason.model');

const checkTeacherCourseAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next();
    }

    let courseId =
      req.params.courseId ||
      req.body.course ||
      req.body.courseId;

    // For editing or deleting a lesson, get its course
    if (!courseId && req.params.id) {
      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      courseId = lesson.course;
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const teacher = await Teacher.findOne({
      user: req.user.id
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    const course = await Course.findOne({
      _id: courseId,
      teachers: teacher._id
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this course'
      });
    }

    req.teacher = teacher;
    req.course = course;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkTeacherCourseAccess;
