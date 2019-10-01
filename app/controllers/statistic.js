const USER_MODEL = require('../models/user')
// const { matchedData } = require('express-validator')
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
        reject(utils.buildErrObject(422, 'ERROR_WITH_FILTER'))
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
          reject(utils.buildErrObject(422, err.message))
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

/*********************
 * Private functions *
 *********************/

/**
 * Count users number each month in database
 * @param {Object} req - request object
 */
const countNewUserNumberPerMonth = async req => {
  return new Promise(async (resolve, reject) => {
    try {
      const CURRENT_YEAR = new Date().getFullYear()

      const item = await USER_MODEL.aggregate([
        {
          $addFields: {
            createdMonth: { $month: '$createdAt' },
            createdYear: { $year: '$createdAt' }
          }
        },
        { $match: { verified: false, createdYear: CURRENT_YEAR } },
        {
          $group: {
            _id: {
              gender: { $ifNull: ['$gender', null] },
              verified: '$verified',
              createdMonth: '$createdMonth'
            },
            newUsersCount: { $sum: 1 }
          }
        }
      ])

      // Array Based
      resolve(item)
    } catch (err) {
      reject(utils.buildErrObject(422, err.message))
    }
  })
}

/**
 * Count users number each gender in database
 * @param {Object} req - request object
 */
const countUserGenderByVerification = async req => {
  return new Promise(async (resolve, reject) => {
    try {
      const item = await USER_MODEL.aggregate([
        {
          $group: {
            _id: {
              gender: { $ifNull: ['$gender', null] },
              verified: '$verified'
            },
            usersCount: { $sum: 1 }
          }
        }
      ])

      // Array Based
      resolve(item)
    } catch (err) {
      reject(utils.buildErrObject(422, err.message))
    }
  })
}

/**
 * Count users number each employmentStatus in database
 * @param {Object} req - request object
 */
const countUserEmploymentStatusByVerification = async req => {
  return new Promise(async (resolve, reject) => {
    try {
      const item = await USER_MODEL.aggregate([
        { $match: { verified: true } },
        {
          $group: {
            _id: {
              employmentStatus: '$employmentStatus'
            },
            usersCount: { $sum: 1 }
          }
        }
      ])

      // Array Based
      resolve(item)
    } catch (err) {
      reject(utils.buildErrObject(422, err.message))
    }
  })
}

/**
 * Count users number each age period in database
 * @param {Object} req - request object
 */
const countUserAgePeriodByVerification = async req => {
  return new Promise(async (resolve, reject) => {
    try {
      const CURRENT_YEAR = new Date().getFullYear()
      const item = await USER_MODEL.aggregate([
        {
          $match: { verified: true }
        },
        {
          $addFields: {
            bobYear: {
              $subtract: [CURRENT_YEAR, { $year: '$bob' }]
            }
          }
        },
        {
          $bucket: {
            groupBy: '$bobYear',
            boundaries: [15, 20, 25, 30, 35],
            default: 'Other',
            output: {
              usersCount: { $sum: 1 }
            }
          }
        }
      ])

      // Array Based
      resolve(item)
    } catch (err) {
      console.error(err)
      reject(utils.buildErrObject(422, err.message))
    }
  })
}

/**
 * Count education each age period in database
 * @param {Object} req - request object
 */
const countUserEducationByVerification = async req => {
  return new Promise(async (resolve, reject) => {
    try {
      const item = await USER_MODEL.aggregate([
        { $match: { verified: true } },
        {
          $group: {
            _id: {
              education: '$education'
            },
            usersCount: { $sum: 1 }
          }
        }
      ])

      // Array Based
      resolve(item)
    } catch (err) {
      console.error(err)
      reject(utils.buildErrObject(422, err.message))
    }
  })
}

/**
 * Count education each heardFrom in database
 * @param {Object} req - request object
 */
const countUserHeardFromByVerification = async req => {
  return new Promise(async (resolve, reject) => {
    try {
      const item = await USER_MODEL.aggregate([
        { $match: { verified: true } },
        {
          $group: {
            _id: {
              heardFrom: '$heardFrom'
            },
            usersCount: { $sum: 1 }
          }
        }
      ])

      // Array Based
      resolve(item)
    } catch (err) {
      console.error(err)
      reject(utils.buildErrObject(422, err.message))
    }
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get New users number per month route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getNewUserNumberPerMonth = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await countNewUserNumberPerMonth())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get New users number gender route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getUserGenderStastic = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await countUserGenderByVerification())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get New users number EmploymentStatus route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getUserEmploymentStatusStastic = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await countUserEmploymentStatusByVerification())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get New users number Age period route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getUserAgePeriodStastic = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await countUserAgePeriodByVerification())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get New users number education route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getUserEducationStastic = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await countUserEducationByVerification())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get New users number heardFrom route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getUserheardFromStastic = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await countUserHeardFromByVerification())
  } catch (error) {
    utils.handleError(res, error)
  }
}
