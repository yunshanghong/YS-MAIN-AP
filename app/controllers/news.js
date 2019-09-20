const model = require('../models/news')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')

/*********************
 * Private functions *
 *********************/

/**
* Creates a new item in database
* @param {Object} req - request object
*/
const createItem = async req => {
  return new Promise((resolve, reject) => {
    const image = new model({
      title: req.title,
      subTitle: req.subTitle,
      imageName: req.imageName,
      content: req.content,
      tags: req.tags,
      published: req.published,
      author: req.authorId,
    })
    image.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }

      resolve(item)
    })
  })
}

/**
 * Gets all items from database
 */
const getAllItemsFromDB = async () => {
  return new Promise((resolve, reject) => {
    model
      .find({}, '-createdAt', { sort: { name: 1 } })
      .populate({ path: 'author', select: 'displayName photoURL email' })
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
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {
    res.status(200).json(await getAllItemsFromDB())
  } catch (error) {
    utils.handleError(res, error)
  }
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
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItem = async (req, res) => {
  try {
    const { newsId } = matchedData(req)
    res.status(200).json(await db.getItem(newsId, model))
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
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await createItem({
      ...data,
      authorId: req.user._id,
    })
    res.status(200).json({
      ...item,
      author: {
        displayName: req.user.displayName,
        photoURL: req.user.photoURL,
        email: req.user.email,
      }
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
    const { newsId } = matchedData(req)
    res.status(200).json(await db.deleteItem(newsId, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}
