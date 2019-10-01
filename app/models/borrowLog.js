const mongoose = require('mongoose')
// const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const borrowLogSchema = new mongoose.Schema(
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
    // Question 3. borrowing date.
    borrowingDate: {
      type: Date,
      required: true
    },
    // Question 4. borrowing time slot.
    borrowingTimeSlot: {
      type: String,
      enum: ['上午', '下午'],
      required: true
    },
    // Question 5. borrowing people number.
    borrowingNumber: {
      type: Number,
      min: 3,
      max: 100,
      required: true
    },
    // Question 6. borrowing intention.
    borrowingIntention: {
      type: String,
      required: true
    },
    // Question 7. what space do you want.
    borrowingSpace: {
      type: String,
      // enum: ['開放空間', '團體諮詢室', '圖資中心', '團體施測室', '商務空間', '亮點工作室'],
      enum: [
        'openSpace',
        'groupConsultationRoom',
        'capitalCenter',
        'groupTestingRoom',
        'businessSpace',
        'highlightStudio'
      ],
      required: true
    },
    // Question 8. where did you hear the YS.
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
borrowLogSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('BorrowLog', borrowLogSchema)
