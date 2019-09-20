const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const InformationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    subTitle: {
      type: String,
      required: true
    },
    imageName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      require: true,
    },
    tags: {
      type: String,
      enum: ['news', 'training', 'skills', 'Interview'],
      retquire: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    published: {
      type: Boolean,
      required: true,
      default: false,
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
InformationSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Information', InformationSchema)
