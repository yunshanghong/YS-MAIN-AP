const mongoose = require('mongoose')
const validator = require('validator')

const UserAccessSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: 'EMAIL_IS_NOT_VALID'
      },
      lowercase: true,
      required: true
    },
    ip: {
      type: String,
      required: true
    },
    browser: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    action: {
      type: String,
      required: true
    },
    byToken: {
      type: Boolean,
      require: true,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
module.exports = mongoose.model('UserAccess', UserAccessSchema)
