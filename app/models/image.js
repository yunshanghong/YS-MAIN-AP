const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const imageSchema = new mongoose.Schema(
  {
    imageName: {
      type: String,
      unique: true,
      required: true
    },
    imageTags: {
      type: [String],
      enum: [undefined, 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'],
      default: undefined,
    },
    imageCaption: {
      type: String,
      default: function () {
        return this.imageName;
      },
      required: true,
    },
    imageHeight: {
      type: Number,
      required: true
    },
    imageWidth: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/svg+xml'],
      required: true
    },
    imageSize: {
      type: Number,
      require: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    versionKey: false,
    timestamps: true
  }
)
imageSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Image', imageSchema)
