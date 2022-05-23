const model = require('../models/document')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const { matchedData } = require('express-validator')

/*********************
 * Private functions *
 *********************/

/**
 * Creates a new item in database
 * @param {Object} req - request object
 */
const createItem = async req => {
  return new Promise((resolve, reject) => {
    const newDocument = new model({
      documentName: req.documentName,
      mimeType: req.mimeType,
      documentSize: req.documentSize,
      // author: {
      //   id: req.authorId,
      //   displayName: req.authorDisplayName,
      //   photoURL: req.authorPhotoURL,
      //   email: req.authorEmail
      // }
      author: req.authorId
    })
    newDocument.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }

      resolve(item.toObject())
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
 * Get Documents function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getDocuments = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getItems(req, model, query))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Upload single Document function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.uploadDocument = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await createItem({
      ...data,
      documentName: req.file.filename,
      authorId: req.user._id
    })
    res.status(200).json({
      ...item,
      author: {
        displayName: req.user.displayName,
        photoURL: req.user.photoURL,
        email: req.user.email
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
exports.deleteDocument = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const { documentId } = matchedData(req)
    res.status(200).json(await db.deleteItem(documentId, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}
