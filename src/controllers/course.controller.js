const Course=require('../models/courses.model')
const Teacher =require('../models/teacher.model')

const createCourse = async (req,res,next)=>{
    try {
           const {
      courseCode,
      courseName,
      description,
      category,
      level,
      language,
      price,
      thumbnail,
      duration,
      teachers
    } = req.body;
      if (
      !courseCode ||
      !courseName ||
      !description ||
      !category ||
      !level ||
      !Array.isArray(teachers) ||
      teachers.length===0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
 const existingTeachers = await Teacher.find({
      _id: { $in: teachers }
    });
    if(existingTeachers.length !== teachers.length){
        return res.status(404).json({ success: false, message: 'One or more teachers not found '})
    }
     // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Course code already exists'
      });
    }
    const course = await Course.create({
      courseCode,
      courseName,
      description,
      category,
      level,
      language,
      price,
      thumbnail,
      duration,
      teachers
    });
     const createdCourse = await Course.findById(course._id)
      .populate({
        path: 'teachers',
        populate: {
          path: 'user',
            select: 'firstName lastName email'
        }
      });
      
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: createdCourse
    });
    } catch (error) {
        next(error)
    }
}


const getAllCourses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      level,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const filter = {};

    // Search by course name or code
    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.$or = [
        { courseName: { $regex: escapedSearch, $options: 'i' } },
        { courseCode: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    // Public users see active courses only
    filter.status = 'active';

    const [courses, totalCourses] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize),
      Course.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      totalCourses,
      currentPage,
      totalPages: Math.ceil(totalCourses / pageSize),
      courses
    });
  } catch (error) {
    next(error);
  }
};


const getCourseById =async (req,res,next)=>{
try {
 const {id}=req.params 
 const course = await Course.findById(id).populate({path:'teachers',populate:{path:'user',select: 'firstName lastName'}})
 if(!course){
  return res.status(404).json({success:false,message:'Course not found'})
 }
 res.status(200).json({success:true,course})
} catch (error) {
  next(error)
}
}

const updateCourseById =async (req,res,next)=>{
try {
  const {id}=req.params 
  const { courseCode,
      courseName,
      description,
      category,
      level,
      language,
      price,
      thumbnail,
      duration,
      teachers
  }=req.body 
  const course = await Course.findById(id)
   if(!course){
  return res.status(404).json({success:false,message:'Course not found'})
 }
  if (courseCode !==undefined){
    const existingCourse = await Course.findOne({courseCode,_id:{$ne:id}})
    if (existingCourse){
      return res.status(409).json({success:false,message:'Course Code already exists'})
    }
    course.courseCode=courseCode
  }
if (teachers !== undefined) {

  if (!Array.isArray(teachers) || teachers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Teachers must be a non-empty array'
    });
  }

  const existingTeachers = await Teacher.find({
    _id: { $in: teachers }
  });

  if (existingTeachers.length !== teachers.length) {
    return res.status(404).json({
      success: false,
      message: 'One or more teachers not found'
    });
  }

  course.teachers = teachers;
}
   if (courseName !== undefined) course.courseName = courseName;
    if (description !== undefined) course.description = description;
    if (level !== undefined) course.level = level;
    if (category !== undefined) { course.category = category;}
    if (language !== undefined) {course.language = language;}
    if (price !== undefined) {course.price = price;}
    if (thumbnail !== undefined) {course.thumbnail = thumbnail;}
    if (duration !== undefined) { course.duration = duration;}

    await course.save();
    const updatedCourse = await Course.findById(id).populate({path:'teachers',populate:{path:'user',select: 'firstName lastName'}})
    res.status(200).json({success:true,course:updatedCourse})

} catch (error) {
  next(error)
}
}

const editCourseStatus = async (req,res,next)=>{
  try {
    const {id}=req.params 
    const {status}=req.body
    if(!status){
      return res.status(400).json({success:false,message:'Status is required'})

    }
    if(!['active','inactive'].includes(status)){
      return res.status(400).json({success:false,message:'Stutas must be active or inactive'})
    }
    const course =await Course.findById(id)
    if(!course){
  return res.status(404).json({success:false,message:'Course not found'})
    }
    course.status=status
  await course.save()
  return res.status(200).json({success:true,message:`Course status changed to ${status} successfuly`,status:course.status})
  } catch (error) {
    next(error)
  }
}
module.exports ={createCourse,getAllCourses,getCourseById,
  updateCourseById,editCourseStatus
}