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
      author: {
        id: req.authorId,
        displayName: req.authorDisplayName,
        photoURL: req.authorPhotoURL,
        email: req.authorEmail
      }
    })
    newDocument.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }

      resolve(item.toObject())
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
      authorId: req.user._id,
      authorDisplayName: req.user.displayName,
      authorPhotoURL: req.user.photoURL,
      authorEmail: req.user.email
    })
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}
