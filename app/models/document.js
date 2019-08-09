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
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: 'AUTHOR_EMAIL_IS_NOT_VALID'
    },
    required: true
  }
})
const documentSchema = new mongoose.Schema(
  {
    documentName: {
      type: String,
      unique: true,
      required: true
    },
    mimeType: {
      type: String,
      enum: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
      ],
      required: true
    },
    documentSize: {
      type: Number,
      require: true
    },
    author: {
      type: AuthorSchema,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
documentSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Document', documentSchema)
