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
      'employmentStatus',
      'companyName',
      'city',
      'postAddress',
      'companyName',
      'serviceDepartment',
      'jobTitle',
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
          label: '顯示名稱',
          value: 'displayName',
          default: '未提供'
        },
        {
          label: '信箱',
          value: 'email',
          default: '未提供'
        },
        {
          label: '是否驗證',
          value: 'verified',
          default: '未提供'
        },
        {
          label: '中文姓名',
          value: 'fullName',
          default: '未提供'
        },
        {
          label: '性別',
          value: 'gender',
          default: '未提供'
        },
        {
          label: '生日',
          value: 'bob',
          default: '未提供'
        },
        {
          label: '手機',
          value: 'phone',
          default: '未提供'
        },
        {
          label: '最高學歷',
          value: 'education',
          default: '未提供'
        },
        {
          label: '學校名稱',
          value: 'schoolName',
          default: '未提供'
        },
        {
          label: '所屬學群',
          value: 'departmentName',
          default: '未提供'
        },
        {
          label: '目前工作狀態',
          value: 'employmentStatus',
          default: '未提供'
        },
        {
          label: '企業名稱',
          value: 'companyName',
          default: '未提供'
        },
        {
          label: '所屬企業部門',
          value: 'serviceDepartment',
          default: '未提供'
        },
        {
          label: '所屬職位',
          value: 'jobTitle',
          default: '未提供'
        },
        {
          label: '居住縣市',
          value: 'city',
          default: '未提供'
        },
        {
          label: '詳細地址',
          value: 'postAddress',
          default: '未提供'
        },
        {
          label: '得知YS管道',
          value: 'heardFrom',
          default: '未提供'
        },
        {
          label: '是否參加過 YS 活動',
          value: 'haveParticipated',
          default: '未提供'
        },
        {
          label: '綁定 Google 帳號',
          value: 'google.displayName',
          default: '未綁定'
        },
        {
          label: '綁定 Facebook 帳號',
          value: 'facebook.displayName',
          default: '未綁定'
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
