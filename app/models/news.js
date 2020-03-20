const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    subTitle: {
      type: String,
      required: true
    },
    postDate: {
      type: Date,
      default: Date.now
    },
    imageName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      require: true
    },
    tags: {
      type: String,
      enum: ['events-list', 'event-teaser', 'event-highlight', 'fast-news'],
      retquire: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    published: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
NewsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('News', NewsSchema)
