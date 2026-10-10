const User = require('../models/user.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Course = require('../models/courses.model');
const Enrollment = require('../models/enrollment.model');
const Progress = require('../models/progress.model')
const Lesson = require('../models/leason.model')


const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments(),
      Course.countDocuments({ status: 'active' }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      Enrollment.countDocuments({ status: 'completed' })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        activeCourses,
        totalEnrollments,
        activeEnrollments,
        completedEnrollments
      }
    });
  } catch (error) {
    next(error);
  }
};


const getCoursesStats = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .select('courseName courseCode status')
      .lean();

    const stats = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.find({
          course: course._id,
          status: { $in: ['active', 'completed'] }
        }).select('_id status');

        const enrollmentIds = enrollments.map(
          (enrollment) => enrollment._id
        );

        const totalLessons = await Lesson.countDocuments({
          course: course._id
        });

        const completedEnrollments = enrollments.filter(
          (enrollment) => enrollment.status === 'completed'
        ).length;

        const progressRecords = enrollmentIds.length
          ? await Progress.find({
              enrollment: { $in: enrollmentIds }
            }).select('enrollment status')
          : [];

        const completedByEnrollment = new Map();

        for (const record of progressRecords) {
          if (record.status === 'completed') {
            const key = record.enrollment.toString();

            completedByEnrollment.set(
              key,
              (completedByEnrollment.get(key) || 0) + 1
            );
          }
        }

        const progressPercentages = enrollments.map((enrollment) => {
          if (totalLessons === 0) return 0;

          const completedLessons =
            completedByEnrollment.get(enrollment._id.toString()) || 0;

          return (completedLessons / totalLessons) * 100;
        });

        const averageProgress = progressPercentages.length
          ? Math.round(
              progressPercentages.reduce((sum, value) => sum + value, 0) /
              progressPercentages.length
            )
          : 0;

        return {
          courseId: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          status: course.status,
          totalEnrollments: enrollments.length,
          completedEnrollments,
          totalLessons,
          averageProgress
        };
      })
    );

    res.status(200).json({
      success: true,
      count: stats.length,
      courses: stats
    });
  } catch (error) {
    next(error);
  }
};


const getAllStudentsPaginated = async (req, res, next) => {
  try {
    const {
      search,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const userFilter = {};

    if (status && ['active', 'inactive'].includes(status)) {
      userFilter.status = status;
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      userFilter.$or = [
        { firstName: { $regex: escapedSearch, $options: 'i' } },
        { lastName: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const matchingUsers = await User.find(userFilter)
      .select('_id')
      .lean();

    const userIds = matchingUsers.map((user) => user._id);

    const studentFilter = {
      user: { $in: userIds }
    };

    const [students, totalStudents] = await Promise.all([
      Student.find(studentFilter)
        .populate('user', 'firstName lastName email phone status')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),
      Student.countDocuments(studentFilter)
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      totalStudents,
      currentPage,
      totalPages: Math.ceil(totalStudents / pageSize),
      students
    });
  } catch (error) {
    next(error);
  }
};


const getAllTeachersPaginated = async (req, res, next) => {
  try {
    const {
      search,
      status,
      specialization,
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const userFilter = {};

    if (status && ['active', 'inactive'].includes(status)) {
      userFilter.status = status;
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      userFilter.$or = [
        { firstName: { $regex: escapedSearch, $options: 'i' } },
        { lastName: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const matchingUsers = await User.find(userFilter)
      .select('_id')
      .lean();

    const teacherFilter = {
      user: { $in: matchingUsers.map((user) => user._id) }
    };

    if (specialization && specialization.trim()) {
      teacherFilter.specialization = {
        $regex: specialization.trim().replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        ),
        $options: 'i'
      };
    }

    const [teachers, totalTeachers] = await Promise.all([
      Teacher.find(teacherFilter)
        .populate('user', 'firstName lastName email phone status')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),
      Teacher.countDocuments(teacherFilter)
    ]);

    res.status(200).json({
      success: true,
      count: teachers.length,
      totalTeachers,
      currentPage,
      totalPages: Math.ceil(totalTeachers / pageSize),
      teachers
    });
  } catch (error) {
    next(error);
  }
};


const getAllCoursesForAdmin = async (req, res, next) => {
  try {
    const {
      search = '',
      status,
      category,
      level,
      page = 1,
      limit = 10
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const filter = {};

    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.$or = [
        { courseName: { $regex: escapedSearch, $options: 'i' } },
        { courseCode: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      filter.level = level;
    }

    const [courses, totalCourses] = await Promise.all([
      Course.find(filter)
        .populate({
          path: 'teachers',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        })
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Course.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      courses,
      pagination: {
        totalCourses,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCourses / pageSize),
        pageSize
      }
    });
  } catch (error) {
    next(error);
  }
};


const getAllEnrollments = async (req, res, next) => {
  try {
    const {
      search = '',
      status,
      courseId,
      page = 1,
      limit = 10
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const filter = {};

    if (status && ['active', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    if (courseId) {
      filter.course = courseId;
    }

    if (search.trim()) {
      const students = await Student.find()
        .populate({
          path: 'user',
          match: {
            $or: [
              { firstName: { $regex: search.trim(), $options: 'i' } },
              { lastName: { $regex: search.trim(), $options: 'i' } },
              { email: { $regex: search.trim(), $options: 'i' } }
            ]
          },
          select: '_id'
        })
        .select('_id user');

      const studentIds = students
        .filter(student => student.user)
        .map(student => student._id);

      filter.student = { $in: studentIds };
    }

    const [enrollments, totalEnrollments] = await Promise.all([
      Enrollment.find(filter)
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            select: 'firstName lastName email'
          }
        })
        .populate('course', 'courseName courseCode status')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Enrollment.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      enrollments,
      pagination: {
        totalEnrollments,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalEnrollments / pageSize),
        pageSize
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCourseEnrollments = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const course = await Course.findById(courseId).select(
      'courseName courseCode status'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const filter = { course: courseId };

    if (status && ['active', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const [enrollments, totalEnrollments] = await Promise.all([
      Enrollment.find(filter)
        .populate({
          path: 'student',
          populate: {
            path: 'user',
            select: 'firstName lastName email phone'
          }
        })
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Enrollment.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      course,
      enrollments,
      pagination: {
        totalEnrollments,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalEnrollments / pageSize),
        pageSize
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active, completed, or cancelled'
      });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate('course', 'courseName courseCode')
      .populate('student');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,getCoursesStats,getAllStudentsPaginated
  ,getAllTeachersPaginated, getAllCoursesForAdmin,getAllEnrollments
  ,getCourseEnrollments,updateEnrollmentStatus
};