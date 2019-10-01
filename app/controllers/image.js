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
      imageTags: req.imageTags,
      imageCaption: req.imageCaption,
      imageHeight: req.imageHeight,
      imageWidth: req.imageWidth,
      mimeType: req.mimeType,
      imageSize: req.imageSize,
      author: req.authorId
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
 * Get Images for manager function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getImagesForManager = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    const { docs } = await db.getItems(req, model, query)
    const imageListResponse = docs.map(item => ({
      url: 'http://localhost:3000/uploads/image/' + item.imageName,
      id: item._id,
      name: item.imageName
    }))
    res.status(200).json(imageListResponse)
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
      imageTags: data.imageTags ? data.imageTags.split(',') : [],
      imageName: req.file.filename,
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
exports.updateImage = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await db.updateItem(data.imageId, model, data)
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
exports.deleteImage = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const { imageId } = matchedData(req)
    res.status(200).json(await db.deleteItem(imageId, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}
