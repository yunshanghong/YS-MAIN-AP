const mongoose = require('mongoose')
// const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const consultingLogSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    consultingDate: {
      type: Date,
      default: undefined
    },
    consultingTimeSlot: {
      type: String,
      default: undefined
    },

    /* Pre Questions */
    // Question 1. consulting intention.
    consultingIntention: {
      type: String,
      required: true
    },
    // Question 2. consulting topic.
    consultingTopic: {
      type: String,
      required: true
    },
    // Question 3. consulting expectation.
    consultingExpectation: {
      type: String,
      required: true
    },
    // Question 4. have participated at least onece.
    consultingHaveParticipated: {
      type: String,
      enum: ['yes', 'no'],
      required: true
    },
    consultingHeardFrom: {
      type: String,
      // 新聞報導、電台廣播、YS臉書、YS官網、台灣就業通網站連結、校園徵才博覽會、校園講座、收到DM、收到E- mail活動通知、親友介紹、其他
      enum: [
        '新聞報導',
        '電台廣播',
        'YS臉書',
        'YS官網',
        '台灣就業通網站連結',
        '校園徵才博覽會',
        '校園講座',
        '收到DM',
        '收到Email活動通知',
        '親友介紹',
        '其他'
      ],
      required: true
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
