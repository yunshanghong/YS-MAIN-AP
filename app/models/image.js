const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const AuthorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String,
    required: true
  },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: 'AUTHOR_EMAIL_IS_NOT_VALID'
    },
    required: true
  }
})
const imageSchema = new mongoose.Schema(
  {
    imageName: {
      type: String,
      unique: true,
      required: true
    },
    mimeType: {
      type: String,
      enum: ['image/jpeg', 'image/png'],
      required: true
    },
    imageSize: {
      type: Number,
      require: true
    },
    author: {
      type: AuthorSchema,
      required: true,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
imageSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Image', imageSchema)
