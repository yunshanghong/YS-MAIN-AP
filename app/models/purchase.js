const mongoose = require('mongoose')
// const validator = require('validator')

const PurchaseSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    package: {
      type: String,
      enum: ['basic', 'pro', 'ultimate'],
      default: 'basic'
    },
    status: {
      type: Boolean,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
module.exports = mongoose.model('Purchase', PurchaseSchema)
