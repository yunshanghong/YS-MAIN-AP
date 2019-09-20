const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    versionKey: false,
    timestamps: true
  }
)
documentSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Document', documentSchema)
