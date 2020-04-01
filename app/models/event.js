const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const eventSchema = new mongoose.Schema(
  {
    coverImageName: {
      type: String,
      required: true
    },
    coverImageCaption: {
      type: String,
    },
    title: {
      type: String,
      required: true
    },
    subTitle: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      required: true
    },
    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
      required: true
    },
    enrollStartDateTime: {
      type: Date,
      required: true
    },
    enrollEndDateTime: {
      type: Date,
      required: true
    },
    maximumOfApplicants: {
      type: Number,
      required: true,
      default: 30
    },
    location: {
      type: String,
      default: '高雄市前金區五福三路21號'
    },
    contactName: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    content: {
      type: String
    },

    speaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Speaker'
    },

    preQuestionList: {
      type: [String],
      // Question 1. the reason to participate.
      // Question 2. where did you get the information.
      // Question 3. what did you expect to the event.
      // Question 4. what is your ID.
      // Question 5. are you a manager.
      // Question 6. Participate in lunch or not.
      // Question 7. what is your lunch type ? meal or vegetarian.
      enum: [
        'participateReason',
        'participantHeardFrom',
        'participantExpectation',
        'participantID',
        'participantIsManager',
        'participateLunch',
        'lunchType'
      ]
    },

    published: {
      type: Boolean,
      required: true,
      default: false
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
eventSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Event', eventSchema)
