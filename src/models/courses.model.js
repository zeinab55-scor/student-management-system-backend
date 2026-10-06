const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true
    },

    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },

    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },

    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Level is required']
    },

    language: {
      type: String,
      default: 'English',
      trim: true
    },

    price: {
      type: Number,
      default: 0,
      min: 0
    },

    thumbnail: {
      type: String,
      trim: true
    },

    duration: {
      type: Number,
      min: 0
    },

    teachers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }
],

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Course', courseSchema);