const {
  Parser
} = require('json2csv')
const uuid = require('uuid')
const moment = require('moment-timezone')
const model = require('../models/milestone')
const {
  matchedData
} = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const emailer = require('../middleware/emailer')

const converterUtils = require('../utils');

/********************
 * Public functions *
 ********************/
/**
 * Creates a new item in database
 * @param {Object} req - request object
 */
const createItem = async req => {
  return new Promise((resolve, reject) => {
    const newEvent = new model({
      year: req.year,
      month: req.month,
      title: req.title,
      description: req.description,
    })
    newEvent.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      } else {
        model
          .findById(item._id)
          .lean()
          .exec((err, resp) => {
            utils.itemNotFound(err, resp, reject, 'NOT_FOUND')
            resolve(resp)
          })
      }
    })
  })
}

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getItems(req, model, query));
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
    const data = matchedData(req)
    const item = await db.updateItem(data._id, model, data)
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
    const data = matchedData(req)
    const item = await createItem({
      ...data,
    })

    res.status(200).json({
      ...item,
    })
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteItem = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const { milestoneId } = matchedData(req)
    res.status(200).json(await db.deleteItem(milestoneId, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}
