require('dotenv-safe').config()
const initMongo = require('../../config/mongo')

// Init MongoDB
initMongo()

const USER_MODEL = require('../models/user')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')

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
        .populate({ path: 'speaker', select: 'displayName title photoURL website' })
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
  },

}

// async function start() {
//   console.time('db')
//   const CURRENT_YEAR = new Date().getFullYear();

//   const verified = await USER_MODEL.aggregate([
//     { $addFields: { "createdMonth": { $month: '$createdAt' }, "createdYear": { $year: '$createdAt' } } },
//     { $match: { "verified": true, "createdYear": CURRENT_YEAR } },
//     {
//       $bucket: {
//         groupBy: "$createdMonth",
//         boundaries: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
//         default: "8",
//         output: {
//           "newUsersCount": { $sum: 1 },
//         }
//       }
//     }
//   ])
//   const unVerified = await USER_MODEL.aggregate([
//     { $addFields: { "createdMonth": { $month: '$createdAt' }, "createdYear": { $year: '$createdAt' } } },
//     { $match: { "verified": false, "createdYear": CURRENT_YEAR } },
//     {
//       $bucket: {
//         groupBy: "$createdMonth",
//         boundaries: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
//         default: "8",
//         output: {
//           "newUsersCount": { $sum: 1 },
//         }
//       }
//     }
//   ])

//   console.log('result ', {
//     verified,
//     unVerified
//   })

//   console.timeEnd('db')
// } 1 2 1 1 1 10

// start();
async function start() {
  console.time('db')
  const CURRENT_YEAR = new Date().getFullYear();

  const verified = await USER_MODEL.aggregate([
    { $addFields: { "createdMonth": { $month: '$createdAt' }, "createdYear": { $year: '$createdAt' } } },
    { $match: { "verified": false, "createdYear": CURRENT_YEAR } },
    {
      "$group": {
        "_id": {
          "gender": { "$ifNull": ["$gender", null] },
          "verified": "$verified",
          "createdMonth": "$createdMonth",
        },
        "newUsersCount": { $sum: 1 }
      }
    }
  ])

  console.log('result ', verified)
  // USER_MODEL.find({}, (err, docs) => {
  //   console.log('docs', docs)
  // })

  console.timeEnd('db')
}

start();

