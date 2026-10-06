const Student = require('../models/student.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

const registerStudent = async (req, res,next) => {
  try {

    const {
     studentId,
      firstName,
      lastName,
      email,
      password,
      phone,
      age,
      address,
      dateOfBirth,
      gender
    } = req.body;

    // Check required fields
    if (
      !studentId ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !age ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check student ID
    const existingStudent = await Student.findOne({ studentId });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student ID already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      age,
      address,
      role: 'student'
    });

    // Create Student
    const newStudent = await Student.create({
       user: newUser._id,
      studentId,
      dateOfBirth,
      gender
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',

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
};

module.exports = {
  registerStudent
};