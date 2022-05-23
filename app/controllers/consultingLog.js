const model = require('../models/consultingLog')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
// const db = require('../middleware/db')

/*********************
 *    DB functions   *
 *********************/
const buildSort = (sort, order) => {
  const sortBy = {}
  sortBy[sort] = order
  return sortBy
}
const cleanPaginationID = result => {
  result.docs.map(element => delete element.id)
  return result
}
const publicListInitOptions = async req => {
  return new Promise(resolve => {
    const order = req.query.order || -1
    const sort = req.query.sort || 'createdAt'
    const sortBy = buildSort(sort, order)
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const options = {
      sort: sortBy,
      select: '-applicant -consultingIntention -consultingExpectation',
      lean: true,
      page,
      limit
    }
    resolve(options)
  })
}
const secretListInitOptions = async req => {
  return new Promise(resolve => {
    const order = req.query.order || -1
    const sort = req.query.sort || 'createdAt'
    const sortBy = buildSort(sort, order)
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const options = {
      sort: sortBy,
      populate: [
        {
          path: 'applicant'
          // select: '-created',
        }
      ],
      lean: true,
      page,
      limit
    }
    resolve(options)
  })
}
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
        reject(utils.buildErrObject(422, 'ERROR_WITH_FILTER'))
      }
    })
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} query - query object
   */
  async getPublicItems(req, _model, query) {
    const options = await publicListInitOptions(req)
    return new Promise((resolve, reject) => {
      _model.paginate(query, options, (err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        resolve(cleanPaginationID(items))
      })
    })
  },
  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} query - query object
   */
  async getSecretItems(req, _model, query) {
    const options = await secretListInitOptions(req)
    return new Promise((resolve, reject) => {
      _model.paginate(query, options, (err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
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
  async updateItem(_id, _model, req) {
    return new Promise((resolve, reject) => {
      _model.findByIdAndUpdate(
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
  async updateItemRegistration({ event, applicant }, _model, req) {
    return new Promise((resolve, reject) => {
      _model.findOneAndUpdate(
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
   * Updates consulting status an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItemConsultingStatus({ _id }, _model, req) {
    return new Promise((resolve, reject) => {
      _model.findOneAndUpdate(
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
   * Cancel Consulting status an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async cancelSelfConsultingStatus({ _id, applicant }, _model, req) {
    return new Promise((resolve, reject) => {
      _model.findOneAndUpdate(
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
  }
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
    const consultingLog = new model({
      applicant: req.applicantId,

      consultingIntention: req.consultingIntention,
      consultingTopic: req.consultingTopic,
      consultingExpectation: req.consultingExpectation,
      consultingHaveParticipated: req.consultingHaveParticipated,
      consultingHeardFrom: req.consultingHeardFrom
    })
    consultingLog.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      } else {
        model
          // .findById(item._id)
          .find({ applicant: req.applicantId })
          .populate({ path: 'applicant' })
          .exec((_err, resp) => {
            utils.itemNotFound(_err, resp, reject, 'NOT_FOUND')
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
const getUserConsultingHistoryFromDB = async userId => {
  return new Promise((resolve, reject) => {
    model
      .find({ applicant: userId }, '-applicant', {
        sort: { createdAt: -1 },
        limit: 20
      })
      .exec((err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }

        resolve(items)
      })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get Self all Consulting log by user id route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItemsBySelfId = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await getUserConsultingHistoryFromDB(req.user._id))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get all Consulting log route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getPublicItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getPublicItems(req, model, query))
  } catch (error) {
    utils.handleError(res, error)
  }
}
/**
 * Get all Consulting log route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getSecretItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    const newQuery = {
      ...query,
      createdAt: { $gte: req.query.startDate, $lt: req.query.endDate }
    }
    res.status(200).json(await db.getSecretItems(req, model, newQuery))
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
      applicantId: req.user._id
    })
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Checkin item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.checkinItem = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const updateStatus = {
      checkinStatus: true
    }
    const item = await db.updateItemConsultingStatus(
      {
        _id: data.consultingId
      },
      model,
      updateStatus
    )
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
    const updateStatus = {}
    if (data.consultingDate) {
      updateStatus.consultingDate = data.consultingDate
    }
    if (data.consultingTimeSlot) {
      updateStatus.consultingTimeSlot = data.consultingTimeSlot
    }
    if (data.appointmentStatus) {
      updateStatus.appointmentStatus = data.appointmentStatus
    }
    if (data.checkinStatus) {
      updateStatus.checkinStatus = data.checkinStatus
    }
    const item = await db.updateItemConsultingStatus(
      {
        _id: data.consultingId
      },
      model,
      updateStatus
    )
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
    const item = await db.cancelSelfConsultingStatus(
      {
        applicant: req.user._id,
        _id: data.consultingId
      },
      model,
      {
        appointmentStatus: 'canceled'
      }
    )
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}
