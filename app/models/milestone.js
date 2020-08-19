const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')
const shortid = require('shortid')
const { stringify } = require('uuid')

const milestoneSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  versionKey: false,
  timestamps: true
})
milestoneSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Milestone', milestoneSchema)
