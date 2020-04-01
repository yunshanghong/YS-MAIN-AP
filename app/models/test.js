const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const TestSchema = new mongoose.Schema(
  {
    name: {
      type: [String],
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
TestSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Test', TestSchema)
