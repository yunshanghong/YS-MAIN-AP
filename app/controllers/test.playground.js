require('dotenv-safe').config()
const csv = require('csv-parser')
const path = require('path')
const fs = require('fs');
const uuid = require('uuid')

const initMongo = require('../../config/mongo')

// Init MongoDB
initMongo()

const Test = require('../models/test')

function start() {
  const test = new Test({
    // name: ['abc', 'asd']
  })
  test.save((err, item) => {
    if (err) {
      reject(err)
    }

    console.log(item)
  })
}

start()
