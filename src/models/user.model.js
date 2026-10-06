const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required']
    },

    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true
    },

    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be greater than 0']
    },

    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },

    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      required: [true, 'Role is required']
    },

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

module.exports = mongoose.model('User', userSchema);