const fs = require('fs')
const path = require('path')
const model = require('../models/user')
const accessModel = require('../models/userAccess')
const utils = require('../middleware/utils')
const { matchedData } = require('express-validator')
const auth = require('../middleware/auth')
const db = require('../middleware/db')

/*********************
 * Private functions *
 *********************/

/**
 * Gets profile from database by id
 * @param {string} id - user id
 */
const getProfileFromDB = async id => {
  return new Promise((resolve, reject) => {
    model.findById(id, '-_id -updatedAt -createdAt', (err, user) => {
      utils.itemNotFound(err, user, reject, 'NOT_FOUND')
      resolve(user)
    })
  })
}

/**
 * Updates profile in database
 * @param {Object} req - request object
 * @param {string} id - user id
 */
const updateProfileInDB = async (req, id) => {
  return new Promise((resolve, reject) => {
    model.findByIdAndUpdate(
      id,
      req,
      {
        new: true,
        runValidators: true,
        select: '-role -_id -updatedAt -createdAt'
      },
      (err, user) => {
        utils.itemNotFound(err, user, reject, 'NOT_FOUND')
        resolve(user)
      }
    )
  })
}

/**
 * Finds user by id
 * @param {string} email - user id
 */
const findUser = async id => {
  return new Promise((resolve, reject) => {
    model.findById(id, 'password email', (err, user) => {
      utils.itemNotFound(err, user, reject, { email: 'USER_DOES_NOT_EXIST' })
      resolve(user)
    })
  })
}

/**
 * Build passwords do not match object
 * @param {Object} user - user object
 */
const passwordsDoNotMatch = async () => {
  return new Promise(resolve => {
    resolve(utils.buildErrObject(409, 'WRONG_PASSWORD'))
  })
}

/**
 * Changes password in database
 * @param {string} id - user id
 * @param {Object} req - request object
 */
const changePasswordInDB = async (id, req) => {
  return new Promise((resolve, reject) => {
    model.findById(id, '+password', (err, user) => {
      utils.itemNotFound(err, user, reject, 'NOT_FOUND')

      // Assigns new password to user
      user.password = req.newPassword

      // Saves in DB
      user.save(error => {
        if (err) {
          reject(utils.buildErrObject(422, error.message))
        }
        resolve(utils.buildSuccObject('PASSWORD_CHANGED'))
      })
    })
  })
}

/**
 * Gets last 8 accesses log from database
 */
const findUserAccesses = async (req, email) => {
  return new Promise((resolve, reject) => {
    accessModel.find(
      { email, byToken: false },
      '-email -_id -createdAt',
      {
        sort: {
          updatedAt: -1
        },
        limit: 3
      },
      (err, accessHistory) => {
        utils.itemNotFound(err, accessHistory, reject, 'NOT_FOUND')
        resolve(accessHistory)
      }
    )
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getProfile = async (req, res) => {
  try {
    const id = await utils.isIDGood(req.user._id)
    res.status(200).json(await getProfileFromDB(id))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update profile function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateProfile = async (req, res) => {
  try {
    await utils.isIDGood(req.user._id)
    const data = matchedData(req)
    const item = await db.updateItem(req.user._id, model, data)
    res.status(200).json(item)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update profile function shortcuts called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateProfileShortcuts = async (req, res) => {
  try {
    const id = await utils.isIDGood(req.user._id)
    req = matchedData(req)
    res.status(200).json(await updateProfileInDB(req, id))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update profile Avatar image function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateAvatar = async (req, res) => {
  try {
    // Find old Image, delete it if exist
    const id = await utils.isIDGood(req.user._id)
    const oldAvatar = req.user.photoURL
    req.photoURL = req.file.filename
    if (
      oldAvatar !== 'assets/images/avatars/penguin.png' &&
      !oldAvatar.includes('http')
    ) {
      fs.unlinkSync(
        path.resolve(__dirname, '../', '../', 'uploads', 'avatar', oldAvatar)
      )
    }
    res.status(200).json(await updateProfileInDB(req, id))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Change password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.changePassword = async (req, res) => {
  try {
    const id = await utils.isIDGood(req.user._id)
    const user = await findUser(id)
    req = matchedData(req)
    const isPasswordMatch = await auth.checkPassword(req.oldPassword, user)
    if (!isPasswordMatch) {
      utils.handleError(res, await passwordsDoNotMatch())
    } else {
      // all ok, proceed to change password
      res.status(200).json(await changePasswordInDB(id, req))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get last 8 access history by user
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAccesses = async (req, res) => {
  try {
    const accessHistory = await findUserAccesses(req, req.user.email)
    res.status(200).json(accessHistory)
  } catch (error) {
    utils.handleError(res, error)
  }
}
