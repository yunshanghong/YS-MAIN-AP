const model = require('../models/borrowLog')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
// const db = require('../middleware/db')

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
  },

  /**
   * Updates borrow status an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItemBorrowStatus({ _id }, model, req) {
    return new Promise((resolve, reject) => {
      model.findOneAndUpdate(
        { _id },
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
   * Cancel borrow status an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async cancelSelfBorrowStatus({ _id, applicant }, model, req) {
    return new Promise((resolve, reject) => {
      model.findOneAndUpdate(
        { _id, applicant },
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

/*********************
 * Private functions *
 *********************/

/**
* Creates a new item in database
* @param {Object} req - request object
*/
const createItem = async req => {
  return new Promise((resolve, reject) => {
    const borrowLog = new model({
      applicant: req.applicantId,

      institutionName: req.institutionName,
      institutionAddress: req.institutionAddress,
      borrowingDate: req.borrowingDate,
      borrowingTimeSlot: req.borrowingTimeSlot,
      borrowingNumber: req.borrowingNumber,
      borrowingIntention: req.borrowingIntention,
      borrowingSpace: req.borrowingSpace,
      borrowingHeardFrom: req.borrowingHeardFrom,
    })
    borrowLog.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      } else {
        model
          // .findById(item._id)
          .find({ applicant: req.applicantId })
          .populate({ path: 'applicant' })
          .exec((err, resp) => {
            utils.itemNotFound(err, resp, reject, 'NOT_FOUND')
            resolve(resp)
          })
        // resolve(item)
      }
    })
  })
}

/**
 * Gets User's all items from database
 */
const getUserBorrowHistoryFromDB = async (userId) => {
  return new Promise((resolve, reject) => {
    model
      .find({ applicant: userId }, '-applicant', { sort: { createdAt: -1 } })
      .exec((err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }

        // console.log('getUserActivitysHistoryFromDB data ', items)
        resolve(items)
      })
  })
}
/**
 * Gets all items from database
 */
const getClosestBorrowHistoryFromDB = async (userId) => {
  return new Promise((resolve, reject) => {
    model
      .find({ applicant: userId }, '-applicant', { sort: { createdAt: -1 } })
      .exec((err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }

        // console.log('getUserActivitysHistoryFromDB data ', items)
        resolve(items)
      })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get Self all borrow log by user id route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItemsBySelfId = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await getUserBorrowHistoryFromDB(req.user._id))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get all borrow log by user id route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await getClosestBorrowHistoryFromDB())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await createItem({
      ...data,
      applicantId: req.user._id,
    })
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItem = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await db.updateItemBorrowStatus({
      _id: data._id,
    }, model, {
      appointmentStatus: data.appointmentStatus,
      checkinStatus: data.checkinStatus,
    })
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Cancel item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.cancelItem = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await db.cancelSelfBorrowStatus({
      applicant: req.user._id,
      _id: data.borrowId,
    }, model, {
      appointmentStatus: 'canceled',
    })
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}
