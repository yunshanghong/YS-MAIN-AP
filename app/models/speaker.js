const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const validator = require('validator')

const SpeakerSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    photoURL: {
      type: String,
      required: true,
      default: 'assets/images/avatars/penguin.png'
    },
    website: {
      type: String,
      validate: {
        validator(v) {
          return v === '' ? true : validator.isURL(v)
        },
        message: 'NOT_A_VALID_URL'
      }
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
SpeakerSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Speaker', SpeakerSchema)
