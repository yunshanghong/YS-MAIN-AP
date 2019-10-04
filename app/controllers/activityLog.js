const model = require('../models/activityLog')
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
   * Updates Checkin status an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItemCheckinStatus({ event, applicant }, model, req) {
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
   * Updates review an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItemReview({ event, applicant }, model, req) {
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
 * Creates a new item in database
 * @param {Object} req - request object
 */
const createItem = async req => {
  return new Promise((resolve, reject) => {
    const activityLog = new model({
      event: req.eventId,
      speaker: req.speakerId,
      applicant: req.applicantId,
      participateReason: req.participateReason,
      participantHeardFrom: req.participantHeardFrom,
      participantExpectation: req.participantExpectation,
      participantID: req.participantID,
      participantIsManager: req.participantIsManager,
      participateLunch: req.participateLunch,
      lunchType: req.lunchType
    })
    activityLog.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      } else {
        model
          .findById(item._id)
          .populate({ path: 'event' })
          .populate({
            path: 'speaker',
            select: 'displayName title photoURL website'
          })
          .populate({ path: 'applicant' })
          .exec((err, resp) => {
            utils.itemNotFound(err, resp, reject, 'NOT_FOUND')
            console.log('resp ', resp)
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
const getUserActivitysHistoryFromDB = async userId => {
  return new Promise((resolve, reject) => {
    model
      .find({ applicant: userId }, '-applicant -createdAt', {
        sort: { createdAt: -1 }
      })
      // .populate({ path: 'applicant', select: 'displayName photoURL email' })
      .populate({ path: 'event', select: '-author -speaker -createdAt' })
      .populate({ path: 'speaker', select: '-createdAt' })
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
 * Gets Event's all items (user activitys) from database
 */
const getEventActivitysHistoryFromDB = async eventId => {
  return new Promise((resolve, reject) => {
    model
      .find({ event: eventId }, '-event -speaker', { sort: { name: 1 } })
      .populate({
        path: 'applicant',
        select: '-facebook -google -verification -createdAt'
      })
      .exec((err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }

        // console.log('getEventActivitysHistoryFromDB data ', items)
        resolve(items)
      })
  })
}
/**
 * Gets Speaker's (max, min, avg) stars by user's reviews from database
 */
// TODO: fix here
const getSpeakerStarsFromDB = async speakerId => {
  return new Promise((resolve, reject) => {
    model
      .find({ speaker: speakerId }, '-createdAt', { sort: { name: 1 } })
      .populate({ path: 'event' })
      .exec((err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }

        console.log('getEventActivitysHistoryFromDB data ', items)
        resolve(items)
      })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get Self all event registration log by user id route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItemsBySelfId = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    res.status(200).json(await getUserActivitysHistoryFromDB(req.user._id))
  } catch (error) {
    utils.handleError(res, error)
  }
}
/**
 * Get User's all event registration log by user id route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItemsByUserId = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    res.status(200).json(await getUserActivitysHistoryFromDB(data.userId))
  } catch (error) {
    utils.handleError(res, error)
  }
}
/**
 * Get Event's all user registration log by event id route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItemsByEventId = async (req, res) => {
  try {
    const data = matchedData(req)
    res.status(200).json(await getEventActivitysHistoryFromDB(data.eventId))
  } catch (error) {
    utils.handleError(res, error)
  }
}
/**
 * Get Speaker's stars by all user reviews by speaker id route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getSpeakerStarsBySpeakerId = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    res.status(200).json(await getSpeakerStarsFromDB(data.speakerId))
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
    const item = await db.updateItemReview(
      {
        event: data.eventId,
        applicant: req.user._id
      },
      model,
      {
        eventStars: data.eventStars,
        speakerStars:
          (Number(data.speakerExpressionStars) +
            Number(data.speakerContentStars)) /
          2,
        speakerExpressionStars: data.speakerExpressionStars,
        speakerContentStars: data.speakerContentStars,
        eventComments: data.eventComments
      }
    )
    res.status(200).json(item)
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
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
// exports.deleteItem = async (req, res) => {
//   try {
//     await utils.isIDGood(req.user._id)
//     const { newsId } = matchedData(req)
//     res.status(200).json(await db.deleteItem(newsId, model))
//   } catch (error) {
//     utils.handleError(res, error)
//   }
// }

/**
 * Update Checkin status item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateCheckinStatusItem = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await db.updateItemCheckinStatus(data, model, {
      checkinStatus: data.updateAction
    })
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update registration status item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateRegistrationItem = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await db.updateItemRegistration(data, model, {
      registrationStatus: data.updateAction
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
    const item = await db.updateItemRegistration(data, model, {
      registrationStatus: 'canceled'
    })
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}
