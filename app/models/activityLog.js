const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const actvityLogSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    speaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Speaker',
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    registrationStatus: {
      type: String,
      enum: ['pending', 'canceled', 'queueing', 'rejected', 'succeeded'],
      default: 'pending',
    },
    checkinStatus: {
      type: Boolean,
      default: false,
    },

    /* Pre Questions */
    // Question 1. the reason to participate.
    participateReason: {
      type: String,
      default: undefined
    },
    // Question 2. where did you get the information.
    participantHeardFrom: {
      type: String,
      enum: ['新聞報導', '電台廣播', 'YS臉書', 'YS官網', '台灣就業通網站連結', '校園徵才博覽會', '校園講座', '收到DM', '收到Email活動通知', '親友介紹', '其他'],
      default: undefined
    },
    // Question 3. what did you expect to the event.
    participantExpectation: {
      type: String,
      default: undefined
    },
    // Question 4. what is your ID.
    participantID: {
      type: String,
      validate: {
        validator: function (v) {
          return validator.isIdentityCard(v, ['zh-TW'])
        },
        message: 'ID_NUMBER_IS_NOT_VALID'
      },
      default: undefined
    },
    // Question 5. are you a manager.
    participantIsManager: {
      type: String,
      eum: ['yes', 'no'],
      default: undefined
    },
    // Question 6. Participate in lunch or not.
    participateLunch: {
      type: String,
      eum: ['yes', 'no'],
      default: undefined
    },
    // Question 7. what is your lunch type ? meal or vegetarian.
    lunchType: {
      type: String,
      eum: ['meal', 'vegetarian'],
      default: undefined
    },
    // Question 8. other custom questions.
    otherQuestions:{
      type: Object,
      default: undefined
    },

    // Reviews
    eventStars: {
      type: Number,
      enum: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    },
    speakerStars: {
      /* Avg of expression and content */
      type: Number,
    },
    speakerExpressionStars: {
      type: Number,
      enum: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    },
    speakerContentStars: {
      type: Number,
      enum: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    },

    eventComments: {
      type: String,
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

/* Index */
actvityLogSchema.index({ event: 1, applicant: 1 }, { unique: true })

/* Plugin */
actvityLogSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('ActivityLog', actvityLogSchema)
