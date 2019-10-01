const mongoose = require('mongoose')
// const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const consultingLogSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    /* Pre Questions */
    // Question 1. consulting date.
    consultingDate: {
      type: Date,
      required: true
    },
    // Question 2. consulting time slot.
    consultingTimeSlot: {
      type: String,
      enum: [
        '10:00-11:00',
        '11:00-12:00',
        '14:00-15:00',
        '15:00-16:00',
        '16:00-17:00'
      ],
      required: true
    },
    // Question 3. consulting topic.
    consultingTopic: {
      type: String,
      enum: [
        '自我認識',
        '職涯方向探索',
        '職涯目標擬定',
        '個人優勢分析',
        '擬定職涯計畫',
        '職能盤點/履歷健診',
        '面試演練',
        '其他'
      ],
      required: true
    },
    // Question 4. consulting intention.
    consultingIntention: {
      type: String
    },
    // Question 5. consulting expectation.
    consultingexpectation: {
      type: String
    },

    appointmentStatus: {
      type: String,
      enum: ['pending', 'canceled', 'queueing', 'rejected', 'succeeded'],
      default: 'pending'
    },
    checkinStatus: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

/* Plugin */
consultingLogSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('ConsultingLog', consultingLogSchema)
