
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true
    },

    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },

    completedAt: {
      type: Date,
      default: null
    },

    watchedDuration: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestaomps: true
  }
);

progressSchema.index(
  { enrollment: 1, lesson: 1 },
  { unique: true }
);

module.exports = mongoose.model('Progress', progressSchema);
