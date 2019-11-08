const mongoose = require('mongoose')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const guideLogSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    /* Pre Questions */
    // Question 1. institution name.
    institutionName: {
      type: String,
      required: true
    },
    // Question 2. institution address.
    institutionAddress: {
      type: String,
      required: true
    },
    // Question 3. guide date.
    guideDate: {
      type: Date,
      required: true
    },
    // Question 4. guide time slot.
    guideTimeSlot: {
      type: String,
      enum: ['上午', '下午'],
      required: true
    },
    // Question 5. guide people number.
    guideNumber: {
      type: String,
      required: true
    },
    // Question 6. guide intention.
    guideIntention: {
      type: String,
      required: true
    },
    // Question 7. where did you hear the YS.
    borrowingHeardFrom: {
      type: String,
      enum: [
        '學校',
        'FB',
        '就博/外展',
        '親友',
        '電視/報章',
        '政府機關',
        'YS 官網',
        '其他'
      ],
      default: undefined
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
guideLogSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('GuideLog', guideLogSchema)
