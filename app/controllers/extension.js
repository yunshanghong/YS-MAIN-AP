const model = require('../models/extension')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')

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
      objType: req.objType,
      data: req.data
    })
    console.log(newEvent)
    newEvent.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      } else {
        model
          .findById(item._id)
          .lean()
          .exec((_err, resp) => {
            utils.itemNotFound(_err, resp, reject, 'NOT_FOUND')
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
    res.status(200).json(await db.getItems(req, model, query))
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
  console.log(req.body)
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
  console.log(req.body)
  try {
    const data = matchedData(req)
    const item = await createItem({
      ...data
    })

    res.status(200).json({
      ...item
    })
  } catch (error) {
    utils.handleError(res, error)
  }
}
