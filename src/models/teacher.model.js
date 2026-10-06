const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required'],
      unique: true,
      trim: true
    },

    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },

    qualification: {
      type: String,
      trim: true
    },

    experienceYears: {
      type: Number,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Teacher', teacherSchema);