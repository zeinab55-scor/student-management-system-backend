const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required']
    },

    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    videoUrl: {
      type: String,
      trim: true
    },

    pdfUrl: {
      type: String,
      trim: true
    },

    content: {
      type: String,
      trim: true
    },

    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: 1
    },

    duration: {
      type: Number,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);