const { Parser } = require('json2csv')
const model = require('../models/user')
const uuid = require('uuid')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const emailer = require('../middleware/emailer')

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
    res.status(200).json(await db.getItems(req, model, query))
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
              default: '未提供'
            },
            {
              label: '顯示名稱',
              value: 'displayName',
              default: '未提供'
            },
            {
              label: '信箱',
              value: 'email',
              default: '未提供'
            },
            {
              label: '是否驗證',
              value: 'verified',
              default: '未提供'
            },
            {
              label: '中文姓名',
              value: 'fullName',
              default: '未提供'
            },
            {
              label: '性別',
              value: 'gender',
              default: '未提供'
            },
            {
              label: '生日',
              value: 'bob',
              default: '未提供'
            },
            {
              label: '手機',
              value: 'phone',
              default: '未提供'
            },
            {
              label: '最高學歷',
              value: 'education',
              default: '未提供'
            },
            {
              label: '學校名稱',
              value: 'schoolName',
              default: '未提供'
            },
            {
              label: '所屬學群',
              value: 'departmentName',
              default: '未提供'
            },
            {
              label: '目前工作狀態',
              value: 'employmentStatus',
              default: '未提供'
            },
            {
              label: '企業名稱',
              value: 'companyName',
              default: '未提供'
            },
            {
              label: '所屬企業部門',
              value: 'serviceDepartment',
              default: '未提供'
            },
            {
              label: '所屬職位',
              value: 'jobTitle',
              default: '未提供'
            },
            {
              label: '居住縣市',
              value: 'city',
              default: '未提供'
            },
            {
              label: '詳細地址',
              value: 'postAddress',
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
              label: '綁定 Google 帳號',
              value: 'google.displayName',
              default: '未綁定'
            },
            {
              label: '綁定 Facebook 帳號',
              value: 'facebook.displayName',
              default: '未綁定'
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
