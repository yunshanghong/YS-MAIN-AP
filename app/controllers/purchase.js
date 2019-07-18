const User = require('../models/user')
const model = require('../models/purchase')
const uuid = require('uuid')
const { matchedData } = require('express-validator/filter')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

/*********************
 * Private functions *
 *********************/

/**
 * Gets last 5 purchase history from database
 */
const getPurchaseFromDB = async id => {
  return new Promise((resolve, reject) => {
    model.find(
      { userId: id },
      '-userId -_id -createdAt',
      {
        sort: {
          updatedAt: -1
        },
        limit: 5
      },
      (err, purchaseHistory) => {
        utils.itemNotFound(err, purchaseHistory, reject, 'NOT_FOUND')
        resolve(purchaseHistory)
      }
    )
  })
}
/**
 * Add user's balance in database
 * @param {Object} id - user's id
 * @param {Object} amount - purchase amount
 */
const addBalanceById = async ({ id, amount }) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      id,
      { $inc: { balance: Number(amount) } },
      (err, user) => {
        utils.itemNotFound(err, user, reject, 'NOT_FOUND')
        resolve(user)
      }
    )
  })
}
/**
 * Save purchase to database
 * @param {Object} invoiceId - token's id
 * @param {Object} userId - user's id
 * @param {Object} package - package name
 * @param {Object} status - purchase status
 */
const savePurchaseToDb = async ({ invoiceId, userId, package, status }) => {
  return new Promise((resolve, reject) => {
    const purchase = new model({ invoiceId, userId, package, status })
    purchase.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Purchase $29 function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.purchaseBasicPackage = async (req, res) => {
  const amount = 29
  try {
    const result = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      description: '1788-啟動投資組合包 29 $',
      source: req.body.data.id
    })

    if (result.status === 'succeeded') {
      addBalanceById({ id: req.user._id, amount: 29 })
      savePurchaseToDb({
        invoiceId: result.id,
        userId: req.user._id,
        package: 'basic',
        status: true
      })
      res.status(200).json({ status: result.status })
    } else {
      savePurchaseToDb({
        invoiceId: result.id,
        userId: req.user._id,
        package: 'basic',
        status: false
      })
      utils.handleError(res, 'purchase error occupied')
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Purchase $39 function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.purchaseProPackage = async (req, res) => {
  const amount = 39
  try {
    const result = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      description: '1788-專業組合包 39 $',
      source: req.body.data.id
    })

    if (result.status === 'succeeded') {
      addBalanceById({ id: req.user._id, amount: 39 })
      savePurchaseToDb({
        invoiceId: result.id,
        userId: req.user._id,
        package: 'pro',
        status: true
      })
      res.status(200).json({ status: result.status })
    } else {
      savePurchaseToDb({
        invoiceId: result.id,
        userId: req.user._id,
        package: 'pro',
        status: false
      })
      utils.handleError(res, 'purchase error occupied')
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Purchase $59 function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.purchaseUltimatePackage = async (req, res) => {
  const amount = 59
  try {
    const result = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      description: '1788-終極投資組合包 59 $',
      source: req.body.data.id
    })

    if (result.status === 'succeeded') {
      addBalanceById({ id: req.user._id, amount: 59 })
      savePurchaseToDb({
        invoiceId: result.id,
        userId: req.user._id,
        package: 'multiple',
        status: true
      })
      res.status(200).json({ status: result.status })
    } else {
      savePurchaseToDb({
        invoiceId: result.id,
        userId: req.user._id,
        package: 'multiple',
        status: false
      })
      utils.handleError(res, 'purchase error occupied')
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get last 3 purchases history route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getPurchaseHistory = async (req, res) => {
  try {
    const id = await utils.isIDGood(req.user._id)
    res.status(200).json(await getPurchaseFromDB(id))
  } catch (error) {
    utils.handleError(res, error)
  }
}
