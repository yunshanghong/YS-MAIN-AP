/* eslint-disable no-dupe-keys */
const { Parser } = require('json2csv')
const uuid = require('uuid')
const moment = require('moment-timezone')
const model = require('../models/user')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const emailer = require('../middleware/emailer')
const authController = require('./auth')

const converterUtils = require('../utils')

/*********************
 * Private functions *
 *********************/

/**
 * Creates a new item in database
 * @param {Object} req - request object
 */
const createItem = async req => {
  return new Promise((resolve, reject) => {
    const user = new model({
      displayName: req.displayName,
      email: req.email,
      password: req.password,
      role: req.role,
      phone: req.phone,
      city: req.city,
      country: req.country,
      verification: uuid.v4()
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      // Removes properties with rest operator
      const removeProperties = ({
        // eslint-disable-next-line no-unused-vars
        password,
        // eslint-disable-next-line no-unused-vars
        blockExpires,
        // eslint-disable-next-line no-unused-vars
        loginAttempts,
        ...rest
      }) => rest
      resolve(removeProperties(item.toObject()))
    })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    const queryRoleUser = {
      ...query,
      role: req.query.role === 'user' ? 'user' : { $not: /user/ }
    }
    const users = await db.getItems(req, model, queryRoleUser)
    const result = {
      ...users,
      docs: users.docs.map(item => ({
        ...item,
        accountStatus: authController.loginStatus(
          item.loginAttempts,
          item.isApplyUnlock
        )
      }))
    }
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get items csv function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getExportSCV = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.body)
    const queryRoleUser = {
      ...query,
      role: req.body.role === 'user' ? 'user' : { $not: /user/ }
    }

    model
      .find(queryRoleUser, '-shortcuts -referralCode -referralList')
      .exec((_err, items) => {
        const parser = new Parser({
          fields: [
            {
              label: '????????????',
              value: '_id'
            },
            {
              label: '????????????',
              value: 'displayName',
              default: '?????????'
            },
            {
              label: '??????',
              value: 'fullName',
              default: '?????????'
            },
            {
              label: '??????',
              value: (row, field) =>
                row.gender
                  ? converterUtils.genderConverter(row.gender)
                  : '?????????',
              default: '?????????'
            },
            {
              label: '??????',
              value: (row, field) =>
                row.bob ? moment().diff(moment(row.bob), 'years') : '?????????',
              default: '?????????'
            },
            {
              label: '??????',
              value: (row, field) =>
                row.bob
                  ? moment(row.bob)
                      .tz('Asia/Taipei')
                      .format('YYYY-MM-DD')
                  : '?????????',
              default: '?????????'
            },
            {
              label: '??????',
              value: 'email',
              default: '?????????'
            },
            {
              label: '??????',
              value: 'phone',
              default: '?????????'
            },
            {
              label: '?????????',
              value: 'city',
              default: '?????????'
            },
            {
              label: '????????????',
              value: 'postAddress',
              default: '?????????'
            },
            {
              label: '?????? Google ??????',
              value: 'google.displayName',
              default: '?????????'
            },
            {
              label: '?????? Facebook ??????',
              value: 'facebook.displayName',
              default: '?????????'
            },
            {
              label: '????????????',
              value: (row, field) =>
                row.education
                  ? converterUtils.educationConverter(row.education)
                  : '?????????',
              default: '?????????'
            },
            {
              label: '????????????',
              value: 'schoolName',
              default: '?????????'
            },
            {
              label: '????????????',
              // value: 'departmentName',
              value: (row, field) =>
                row.departmentName
                  ? converterUtils.departmentNameConverter(row.departmentName)
                  : '?????????',
              default: '?????????'
            },
            {
              label: '????????????',
              value: (row, field) => (row.majorName ? row.majorName : '?????????'),
              default: '?????????'
            },
            {
              label: '????????????',
              // value: 'employmentStatus',
              value: (row, field) =>
                row.employmentStatus
                  ? converterUtils.statusConverter(row.employmentStatus)
                  : '?????????',
              default: '?????????'
            },

            {
              label: '????????????',
              value: 'companyName',
              default: '?????????'
            },
            {
              label: '????????????',
              value: 'serviceDepartment',
              default: '?????????'
            },
            {
              label: '??????',
              value: 'jobTitle',
              default: '?????????'
            },
            {
              label: '????????????',
              value: 'jobDescription',
              default: '?????????'
            },
            {
              label: '???????????? - 2',
              value: 'companyName2',
              default: '?????????'
            },
            {
              label: '???????????? - 2',
              value: 'jobTitle2',
              default: '?????????'
            },
            {
              label: '???????????? - 2',
              value: 'jobDescription2',
              default: '?????????'
            },
            {
              label: '???????????? - 3',
              value: 'companyName3',
              default: '?????????'
            },
            {
              label: '???????????? - 3',
              value: 'jobTitle3',
              default: '?????????'
            },
            {
              label: '???????????? - 3',
              value: 'jobDescription3',
              default: '?????????'
            },
            {
              label: '??????YS??????',
              value: 'heardFrom',
              default: '?????????'
            },
            {
              label: '??????????????? YS ??????',
              value: 'haveParticipated',
              default: '?????????'
            },
            {
              label: '??? YS ???????????????',
              value: 'serviceRequirements',
              default: '?????????'
            },
            {
              label: '????????????',
              value: 'createdAt',
              value: (row, field) =>
                moment(row.createdAt)
                  .tz('Asia/Taipei')
                  .format('YYYY-MM-DD'),
              default: '?????????'
            },
            {
              label: '????????????',
              value: 'verified',
              value: (row, field) => (row.verified ? '?????????' : '?????????'),
              default: '?????????'
            }
          ]
        })

        const csv = parser.parse(items)
        /* NOTE */
        // const dateTime = moment().format('YYYYMMDDhhmmss')
        // const filePath = path.join(
        //   __dirname,
        //   '../',
        //   '../',
        //   'exports',
        //   'ys-users-' + dateTime + '.csv'
        // )
        // fs.writeFile(filePath, csv, err => {
        //   if (err) {
        //     console.log('err, ', err)
        //   } else {
        //     setTimeout(() => {
        //       fs.unlinkSync(filePath)
        //     }, 30 * 60 * 1000)

        //     res.set('Content-Type', 'application/octet-stream')
        //     res.status(200).send(Buffer.from(csv))
        //   }
        // })
        res.set('Content-Type', 'application/octet-stream')
        res.status(200).send(Buffer.from(csv))
      })
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
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    res.status(200).json(await db.getItem(id, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}

// /**
//  * Update item function called by route
//  * @param {Object} req - request object
//  * @param {Object} res - response object
//  */
// exports.updateItem = async (req, res) => {
//   try {
//     req = matchedData(req)
//     const id = await utils.isIDGood(req.id)
//     const doesEmailExists = await emailer.emailExistsExcludingMyself(
//       id,
//       req.email
//     )
//     if (!doesEmailExists) {
//       res.status(200).json(await db.updateItem(id, model, req))
//     }
//   } catch (error) {
//     utils.handleError(res, error)
//   }
// }

/**
 * Update self item receiving email status function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItemReceivingEmailStatus = async (req, res) => {
  try {
    const data = matchedData(req)
    const userId = await utils.isIDGood(req.user._id)

    res.status(200).json(
      await db.updateItem(userId, model, {
        receivingEmail: data.receivingEmailStatus
      })
    )
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update item Activation function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItemActivation = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    const doesEmailExists = await emailer.emailExistsExcludingMyself(
      id,
      req.email
    )
    if (!doesEmailExists) {
      res.status(200).json(await db.updateItem(id, model, req))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update item Permission function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItemPermission = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    const doesEmailExists = await emailer.emailExistsExcludingMyself(
      id,
      req.email
    )
    if (!doesEmailExists) {
      res.status(200).json(await db.updateItem(id, model, req))
    }
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
    // Gets locale from header 'Accept-Language'
    const locale = req.getLocale()
    req = matchedData(req)
    const doesEmailExists = await emailer.emailExists(req.email)
    if (!doesEmailExists) {
      const item = await createItem(req)
      emailer.sendRegistrationEmailMessage(locale, item)
      res.status(201).json(item)
    }
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
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    res.status(200).json(await db.deleteItem(id, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}
