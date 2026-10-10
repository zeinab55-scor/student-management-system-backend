const Progress = require('../models/progress.model')
const Student =require('../models/student.model')
const Lesson = require('../models/leason.model')
const Enrollment = require('../models/enrollment.model')
const Course =require('../models/courses.model')

const completeLesson =async (req,res,next)=>{
    try {
        const {lessonId}=req.params 
        const student = await Student.findOne({user:req.user.id})
        if(!student){
            return res.status(404).json({success:false,massage:'Student profile not found'})
        }
        const lesson = await Lesson.findById(lessonId)
        if(!lesson){
            return res.status(404).json({success:false,massage:'Lesson not found'})
         }
         const enrollment = await Enrollment.findOne({
            student:student._id,
            course:lesson.course,
            status:'active'
         })
         if(!enrollment){
            return res.status(403).json({success:false,massage:'You are not enrolled in this course'})
                 }
       const progress =await Progress.findOneAndUpdate({
        enrollment:enrollment._id,
        lesson:lesson._id
       },{
        $set:{
            status:'completed',
            completedAt:new Date()
        },
          $setOnInsert: {
          watchedDuration: 0
        }
       },
         {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    )
       res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      progress
    });

    } catch (error) {
        next(error)
    }
}

const getMyProgress = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      user: req.user.id
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const enrollments = await Enrollment.find({
      student: student._id,
      status: 'active'
    }).populate('course', 'courseName courseCode');

    const progressData = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = await Lesson.countDocuments({
          course: enrollment.course._id
        });

        const completedLessons = await Progress.countDocuments({
          enrollment: enrollment._id,
          status: 'completed'
        });

        const progressPercentage = totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100);

        return {
          enrollmentId: enrollment._id,
          course: enrollment.course,
          totalLessons,
          completedLessons,
          progressPercentage
        };
      })
    );

    res.status(200).json({success: true,
      count: progressData.length,
      progress: progressData
    });

  } catch (error) {
    next(error);
  }
};

const getCourseLessonsProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const student = await Student.findOne({
      user: req.user.id
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const lessons = await Lesson.find({
      course: courseId
    }).sort({ order: 1 });

    const lessonProgress = await Progress.find({
      enrollment: enrollment._id
    });

    const progressMap = new Map(
      lessonProgress.map((item) => [
        item.lesson.toString(),
        item
      ])
    );

    const lessonsWithProgress = lessons.map((lesson) => {
      const progress = progressMap.get(lesson._id.toString());

      return {
        lesson,
        status: progress?.status || 'not-started',
        completedAt: progress?.completedAt || null,
        watchedDuration: progress?.watchedDuration || 0
      };
    });

    const totalLessons = lessons.length;

    const completedLessons = lessonsWithProgress.filter(
      (item) => item.status === 'completed'
    ).length;

    const progressPercentage = totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

    res.status(200).json({
      success: true,
      courseId,
      totalLessons,
      completedLessons,
      progressPercentage,
      lessons: lessonsWithProgress
    });

  } catch (error) {
    next(error);
  }
};


const updateLessonProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { status, watchedDuration } = req.body;

    if (
      status !== undefined &&
      !['not-started', 'in-progress', 'completed'].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid progress status'
      });
    }

    if (
      watchedDuration !== undefined &&
      (!Number.isFinite(watchedDuration) || watchedDuration < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'watchedDuration must be a non-negative number'
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

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: lesson.course,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const update = {};

    if (status !== undefined) {
      update.status = status;
    }

    if (watchedDuration !== undefined) {
      update.watchedDuration = watchedDuration;
    }

    if (status === 'completed') {
      update.completedAt = new Date();
    } else if (status === 'in-progress' || status === 'not-started') {
      update.completedAt = null;
    }

    const progress = await Progress.findOneAndUpdate(
      {
        enrollment: enrollment._id,
        lesson: lesson._id
      },
      {
        $set: update
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Lesson progress updated successfully',
      progress
    });
  } catch (error) {
    next(error);
  }
};



const getStudentCourseProgress = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const course = await Course.findById(courseId).select(
      'courseName courseCode teachers'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Teachers can only view courses assigned to them
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({
        user: req.user.id
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Teacher profile not found'
        });
      }

      const isAssigned = course.teachers.some(
        (id) => id.toString() === teacher._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this course'
        });
      }
    }

    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: course._id,
      status: { $in: ['active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    const lessons = await Lesson.find({
      course: course._id
    }).sort({ order: 1 });

    const records = await Progress.find({
      enrollment: enrollment._id
    });

    const progressMap = new Map(
      records.map((record) => [
        record.lesson.toString(),
        record
      ])
    );

    const lessonsProgress = lessons.map((lesson) => {
      const record = progressMap.get(lesson._id.toString());

      return {
        lessonId: lesson._id,
        title: lesson.title,
        order: lesson.order,
        status: record?.status || 'not-started',
        completedAt: record?.completedAt || null,
        watchedDuration: record?.watchedDuration || 0
      };
    });

    const totalLessons = lessons.length;

    const completedLessons = lessonsProgress.filter(
      (lesson) => lesson.status === 'completed'
    ).length;

    res.status(200).json({
      success: true,
      studentId: student._id,
      course: {
        _id: course._id,
        courseName: course.courseName,
        courseCode: course.courseCode
      },
      enrollmentStatus: enrollment.status,
      totalLessons,
      completedLessons,
      progressPercentage: totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100),
      lessons: lessonsProgress
    });
  } catch (error) {
    next(error);
  }
};


module.exports={completeLesson,getMyProgress,getCourseLessonsProgress,
    updateLessonProgress, getStudentCourseProgress}