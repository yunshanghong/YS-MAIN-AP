const { Parser } = require('json2csv')
const uuid = require('uuid')
const moment = require('moment')
const model = require('../models/user')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const emailer = require('../middleware/emailer')

const converterUtils = require('../utils');

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
      role: 'user'
    }
    res.status(200).json(await db.getItems(req, model, queryRoleUser))
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
    model
      .find({ role: 'user' }, '-shortcuts -referralCode -referralList')
      .exec((err, items) => {
        const parser = new Parser({
          fields: [
            {
              label: '會員編號',
              value: '_id',
            },
            {
              label: '顯示名稱',
              value: 'displayName',
              default: '未提供'
            },
            {
              label: '全名',
              value: 'fullName',
              default: '未提供'
            },
            {
              label: '性別',
              value: (row, field) => row['gender'] ? (
                converterUtils.genderConverter(row['gender'])
              ) : '未提供',
              default: '未提供'
            },
            {
              label: '年齡',
              value: (row, field) => row['bob'] ? (
                moment().diff(moment(row['bob']), 'years')
              ) : '未提供',
              default: '未提供'
            },
            {
              label: '生日',
              value: (row, field) => row['bob'] ? (
                moment(row['bob']).format('YYYY-MM-DD')
              ) : '未提供',
              default: '未提供'
            },
            {
              label: '信箱',
              value: 'email',
              default: '未提供'
            },
            {
              label: '電話',
              value: 'phone',
              default: '未提供'
            },
            {
              label: '居住地',
              value: 'city',
              default: '未提供'
            },
            {
              label: '詳細地址',
              value: 'postAddress',
              default: '未提供'
            },
            {
              label: '綁定 Google 帳號',
              value: 'google.displayName',
              default: '未綁定'
            },
            {
              label: '綁定 Facebook 帳號',
              value: 'facebook.displayName',
              default: '未綁定'
            },
            {
              label: '教育程度',
              value: (row, field) => row['education'] ? (
                converterUtils.educationConverter(row['education'])
              ) : '未提供',
              default: '未提供'
            },
            {
              label: '學校名稱',
              value: 'schoolName',
              default: '未提供'
            },
            {
              label: '學群類別',
              // value: 'departmentName',
              value: (row, field) => row['departmentName'] ? (
                converterUtils.departmentNameConverter(row['departmentName'])
              ) : '未提供',
              default: '未提供'
            },
            {
              label: '身分狀態',
              // value: 'employmentStatus',
              value: (row, field) => row['employmentStatus'] ? (
                converterUtils.statusConverter(row['employmentStatus'])
              ) : '未提供',
              default: '未提供'
            },

            {
              label: '任職企業',
              value: 'companyName',
              default: '未提供'
            },
            {
              label: '任職部門',
              value: 'serviceDepartment',
              default: '未提供'
            },
            {
              label: '職稱',
              value: 'jobTitle',
              default: '未提供'
            },
            {
              label: '工作內容',
              value: 'jobDescription',
              default: '未提供'
            },
            {
              label: '企業名稱 - 2',
              value: 'companyName2',
              default: '未提供'
            },
            {
              label: '所屬職位 - 2',
              value: 'jobTitle2',
              default: '未提供'
            },
            {
              label: '工作內容 - 2',
              value: 'jobDescription2',
              default: '未提供'
            },
            {
              label: '企業名稱 - 3',
              value: 'companyName3',
              default: '未提供'
            },
            {
              label: '所屬職位 - 3',
              value: 'jobTitle3',
              default: '未提供'
            },
            {
              label: '工作內容 - 3',
              value: 'jobDescription3',
              default: '未提供'
            },
            {
              label: '得知YS管道',
              value: 'heardFrom',
              default: '未提供'
            },
            {
              label: '是否參加過 YS 活動',
              value: 'haveParticipated',
              default: '未提供'
            },
            {
              label: '對 YS 的服務需求',
              value: 'serviceRequirements',
              default: '未提供'
            },
            {
              label: '加入日期',
              value: 'createdAt',
              value: (row, field) => moment(row['createdAt']).format('YYYY-MM-DD'),
              default: '未提供'
            },
            {
              label: '是否驗證',
              value: 'verified',
              value: (row, field) => row['verified'] ? '已驗證' : '未驗證',
              default: '未提供'
            },
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
