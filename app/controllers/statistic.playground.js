const path = require('path')
const fs = require('fs')
const { Parser, AsyncParser } = require('json2csv')
require('dotenv-safe').config()
const initMongo = require('../../config/mongo')

// Init MongoDB
initMongo()

const USER_MODEL = require('../models/user')
const ACTIVITY_MODEL = require('../models/activityLog')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')

const asyncParser = new AsyncParser(
  {
    fields: [
      '_id',
      'role',
      'displayName',
      'photoURL',
      'email',
      'verified',
      'active',
      'fullName',
      'gender',
      'bob',
      'phone',
      'education',
      'schoolName',
      'departmentName',
      'majorName',
      'employmentStatus',
      'companyName',
      'city',
      'postAddress',
      'companyName',
      'serviceDepartment',
      'jobTitle',
      'jobDescription',
      'companyName2',
      'jobTitle2',
      'jobDescription2',
      'companyName3',
      'jobTitle3',
      'jobDescription3',
      'heardFrom',
      'haveParticipated',
      'google.displayName',
      'facebook.displayName'
    ]
  },
  { highWaterMark: 8192 }
)

/*********************
 *    DB functions   *
 *********************/
const db = {
  /**
   * Checks the query string for filtering records
   * query.filter should be the text to search (string)
   * query.fields should be the fields to search into (array)
   * @param {Object} query - query object
   */
  async checkQueryString(query) {
    return new Promise((resolve, reject) => {
      try {
        if (
          typeof query.filter !== 'undefined' &&
          typeof query.fields !== 'undefined'
        ) {
          const data = {
            $or: []
          }
          const array = []
          // Takes fields param and builds an array by splitting with ','
          const arrayFields = query.fields.split(',')
          // Adds SQL Like %word% with regex
          arrayFields.map(item => {
            array.push({
              [item]: {
                $regex: new RegExp(query.filter, 'i')
              }
            })
          })
          // Puts array result in data
          data.$or = array
          resolve(data)
        } else {
          resolve({})
        }
      } catch (err) {
        console.log(err.message)
        reject(buildErrObject(422, 'ERROR_WITH_FILTER'))
      }
    })
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} query - query object
   */
  async getItems(req, model, query) {
    const options = await listInitOptions(req)
    return new Promise((resolve, reject) => {
      model.paginate(query, options, (err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(cleanPaginationID(items))
      })
    })
  },

  /**
   * Gets item from database by id
   * @param {string} id - item id
   */
  async getItem(id, model) {
    return new Promise((resolve, reject) => {
      model
        .findById(id)
        .populate({ path: 'event' })
        .populate({
          path: 'speaker',
          select: 'displayName title photoURL website'
        })
        .populate({ path: 'applicant' })
        .exec((err, item) => {
          utils.itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        })
    })
  },

  /**
   * Updates an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItem(_id, model, req) {
    return new Promise((resolve, reject) => {
      model.findByIdAndUpdate(
        _id,
        req,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          utils.itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  },

  /**
   * Updates registration status an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItemRegistration({ event, applicant }, model, req) {
    return new Promise((resolve, reject) => {
      console.log('{ event, applicant } ', { event, applicant })
      model.findOneAndUpdate(
        { event, applicant },
        req,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          utils.itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  }
}

// // start();
// async function start() {
//   console.time('db')
//   const CURRENT_YEAR = new Date().getFullYear()

//   const verified = await USER_MODEL.aggregate([
//     {
//       $addFields: {
//         createdMonth: { $month: '$createdAt' },
//         createdYear: { $year: '$createdAt' }
//       }
//     },
//     { $match: { createdYear: CURRENT_YEAR } },
//     {
//       $group: {
//         _id: {
//           gender: { $ifNull: ['$gender', null] },
//           verified: '$verified',
//           createdMonth: '$createdMonth'
//         },
//         newUsersCount: { $sum: 1 }
//       }
//     }
//   ])

//   console.log('result ', verified)
//   console.timeEnd('db')
// }
// start();
async function start() {
  USER_MODEL.find(
    { role: 'user' },
    '-shortcuts -referralCode -referralList'
  ).exec((err, resp) => {
    const parser = new Parser({
      fields: [
        {
          label: '????????????',
          value: 'displayName',
          default: '?????????'
        },
        {
          label: '??????',
          value: 'email',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'verified',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'fullName',
          default: '?????????'
        },
        {
          label: '??????',
          value: 'gender',
          default: '?????????'
        },
        {
          label: '??????',
          value: 'bob',
          default: '?????????'
        },
        {
          label: '??????',
          value: 'phone',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'education',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'schoolName',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'departmentName',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'majorName',
          default: '?????????'
        },
        {
          label: '??????????????????',
          value: 'employmentStatus',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'companyName',
          default: '?????????'
        },
        {
          label: '??????????????????',
          value: 'serviceDepartment',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'jobTitle',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'jobDescription',
          default: '?????????'
        },
        {
          label: '???????????? - 2',
          value: 'companyName2',
          default: '?????????'
        },
        {
          label: '???????????? - 2',
          value: 'jobTitle2',
          default: '?????????'
        },
        {
          label: '???????????? - 2',
          value: 'jobDescription2',
          default: '?????????'
        },
        {
          label: '???????????? - 3',
          value: 'companyName3',
          default: '?????????'
        },
        {
          label: '???????????? - 3',
          value: 'jobTitle3',
          default: '?????????'
        },
        {
          label: '???????????? - 3',
          value: 'jobDescription3',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'city',
          default: '?????????'
        },
        {
          label: '????????????',
          value: 'postAddress',
          default: '?????????'
        },
        {
          label: '??????YS??????',
          value: 'heardFrom',
          default: '?????????'
        },
        {
          label: '??????????????? YS ??????',
          value: 'haveParticipated',
          default: '?????????'
        },
        {
          label: '?????? Google ??????',
          value: 'google.displayName',
          default: '?????????'
        },
        {
          label: '?????? Facebook ??????',
          value: 'facebook.displayName',
          default: '?????????'
        }
      ]
    })

    let temp = []

    for (let i = 0; i < 1000; i++) {
      temp = temp.concat(resp)
    }

    const csv = parser.parse(temp)
    console.log(csv)

    const filePath = path.join(
      __dirname,
      '../',
      '../',
      'export',
      'ys-users.csv'
    )

    fs.writeFile(filePath, csv, err => {
      if (err) {
        console.log('err, ', err)
      } else {
        // setTimeout(() => {
        //   console.log('deleted, ')
        //   fs.unlinkSync(filePath)
        // }, 10000)
      }
    })
  })
}

start()
