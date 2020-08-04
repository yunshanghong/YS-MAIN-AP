const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')
const shortid = require('shortid')

const extensionSchema = new mongoose.Schema({
  objType: {
    type: String,
    required: true
  },
  data:{
    type: Array,
    required: true
  }
}, {
  versionKey: false,
  timestamps: true
})
extensionSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Extension', extensionSchema)
