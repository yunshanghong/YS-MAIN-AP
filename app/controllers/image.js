const model = require('../models/image')
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
    const image = new model({
      imageName: req.imageName,
      mimeType: req.mimeType,
      imageSize: req.imageSize,
      author: {
        id: req.authorId,
        displayName: req.authorDisplayName,
        photoURL: req.authorPhotoURL,
        email: req.authorEmail
      }
    })
    image.save((err, item) => {
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
 * Get Images function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getImages = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getItems(req, model, query))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Upload single Image function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.uploadImage = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await createItem({
      ...data,
      imageName: req.file.filename,
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
