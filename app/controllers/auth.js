/* eslint-disable max-statements */
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const UserAccess = require('../models/userAccess')
const ForgotPassword = require('../models/forgotPassword')
const ApplyUnlock = require('../models/applyUnlock')
const utils = require('../middleware/utils')
const uuid = require('uuid')
const { addHours } = require('date-fns')
const { matchedData } = require('express-validator')
const auth = require('../middleware/auth')
const emailer = require('../middleware/emailer')
const svgCaptcha = require('svg-captcha')
const HOURS_TO_BLOCK = 2
const LOGIN_ATTEMPTS = 2

/* TODO: update facebook/google login flow */
/*********************
 * Private functions *
 *********************/

/**
 * Generates a token
 * @param {Object} user - user object
 */
const generateToken = user => {
  // Gets expiration time
  const expiration =
    Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES

  // returns signed and encrypted token
  // return auth.encrypt(
  //   jwt.sign(
  //     {
  //       data: {
  //         _id: user
  //       },
  //       exp: expiration
  //     },
  //     process.env.JWT_SECRET
  //   )
  // )
  return jwt.sign(
    {
      data: {
        _id: user
      },
      exp: expiration
    },
    process.env.JWT_SECRET
  )
}

/**
 * Creates an object with user info
 * @param {Object} req - request object
 */
const setUserInfo = req => {
  let user = {
    uuid: req._id,
    from: 'm-lab-db',
    role: req.role,
    data: {
      displayName: req.displayName,
      photoURL: req.photoURL,
      email: req.email,
      fullName: req.fullName,
      gender: req.gender,
      bob: req.bob,
      phone: req.phone,
      education: req.education,
      schoolName: req.schoolName,
      departmentName: req.departmentName,
      majorName: req.majorName,
      employmentStatus: req.employmentStatus,
      receivingEmail: req.receivingEmail,
      city: req.city,
      lastPasswordUpdatedAt: req.lastPasswordUpdatedAt,
      postAddress: req.postAddress,
      companyName: req.companyName,
      serviceDepartment: req.serviceDepartment,
      jobTitle: req.jobTitle,
      jobDescription: req.jobDescription,
      companyName2: req.companyName2,
      jobTitle2: req.jobTitle2,
      jobDescription2: req.jobDescription2,
      companyName3: req.companyName3,
      jobTitle3: req.jobTitle3,
      jobDescription3: req.jobDescription3,
      firstYearOfCareer: req.firstYearOfCareer,
      heardFrom: req.heardFrom,
      motivation: req.motivation,
      serviceRequirements: req.serviceRequirements,
      haveParticipated: req.haveParticipated,
      settings: {
        layout: {
          style: 'layout2',
          config: {
            navbar: {
              folded: true
            },
            footer: {
              style: 'static'
            }
          }
        },
        customScrollbars: true,
        theme: {
          main: 'sunset',
          navbar: 'sunset',
          toolbar: 'sunset',
          footer: 'sunset'
        }
      },
      shortcuts: req.shortcuts,
      google: req.google
        ? {
            id: req.google.id,
            displayName: req.google.displayName,
            email: req.google.email,
            photoURL: req.google.photoURL,
            accessToken: req.google.accessToken
          }
        : null,
      facebook: req.facebook
        ? {
            id: req.facebook.id,
            displayName: req.facebook.displayName,
            email: req.facebook.email,
            photoURL: req.facebook.photoURL,
            accessToken: req.facebook.accessToken
          }
        : null,
      isSystemPassword: req.isSystemPassword
    },
    verified: req.verified,
    active: req.active
  }
  // Adds verification for testing purposes
  if (process.env.NODE_ENV !== 'production') {
    user = {
      ...user,
      verification: req.verification
    }
  }
  return user
}

/**
 * Saves a new user access
 * @param {Object} req - request object
 * @param {Object} user - user object
 */
const saveUserAccess = async (req, user) => {
  return new Promise((resolve, reject) => {
    const userAccess = new UserAccess({
      email: user.email,
      ip: utils.getIP(req),
      browser: utils.getBrowserInfo(req),
      country: utils.getCountry(req),
      method: req.method,
      action: `${req.baseUrl}${req.path}`
    })
    userAccess.save(err => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      // Returns data with access token
      resolve()
    })
  })
}

/**
 * Saves a new user access and then returns token
 * @param {Object} req - request object
 * @param {Object} user - user object
 */
const saveUserAccessAndReturnToken = async ({ req, user, byToken }) => {
  return new Promise((resolve, reject) => {
    const userAccess = new UserAccess({
      email: user.email,
      ip: utils.getIP(req),
      browser: utils.getBrowserInfo(req),
      country: utils.getCountry(req),
      method: req.method,
      action: `${req.baseUrl}${req.path}`,
      byToken: !!byToken
    })
    userAccess.save(err => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      const userInfo = setUserInfo(user)
      // Returns data with access token
      resolve({
        access_token: generateToken(user._id), // eslint-disable-line
        user: userInfo
      })
    })
  })
}

/**
 * Blocks a user by setting blockExpires to the specified date based on constant HOURS_TO_BLOCK
 * @param {Object} user - user object
 */
const blockUser = async user => {
  return new Promise((resolve, reject) => {
    user.blockExpires = addHours(new Date(), HOURS_TO_BLOCK)
    user.save((err, result) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      if (result) {
        resolve(utils.buildErrObject(409, 'BLOCKED_USER'))
      }
    })
  })
}

/**
 * Saves login attempts to dabatabse
 * @param {Object} user - user object
 */
const saveLoginAttemptsToDB = async user => {
  return new Promise((resolve, reject) => {
    user.save((err, result) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      if (result) {
        resolve(true)
      }
    })
  })
}

/**
 * Checks that login attempts are greater than specified in constant and also that blockexpires is less than now
 * @param {Object} user - user object
 */
const blockIsExpired = user =>
  user.loginAttempts > LOGIN_ATTEMPTS && user.blockExpires <= new Date()

/**
 *
 * @param {Object} user - user object.
 */
const checkLoginAttemptsAndBlockExpires = async user => {
  return new Promise((resolve, reject) => {
    // Let user try to login again after blockexpires, resets user loginAttempts
    if (blockIsExpired(user)) {
      user.loginAttempts = 0
      user.save((err, result) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        if (result) {
          resolve(true)
        }
      })
    } else {
      // User is not blocked, check password (normal behaviour)
      resolve(true)
    }
  })
}

const loginStatus = (attempts, isApplied) => {
  if (attempts > LOGIN_ATTEMPTS && isApplied) {
    return 'applied'
  }
  if (attempts > LOGIN_ATTEMPTS && !isApplied) {
    return 'locked'
  }
  if (attempts <= LOGIN_ATTEMPTS && !isApplied) {
    return 'pass'
  }
  return 'undefined'
}

/**
 * Checks if blockExpires from user is greater than now
 * @param {Object} user - user object
 */
const userIsBlocked = async user => {
  return new Promise((resolve, reject) => {
    const result = loginStatus(user.loginAttempts, user.isApplyUnlock)

    if (result === 'locked') {
      reject(
        utils.buildErrObject(403, '???????????????????????????????????????????????????????????????')
      )
    }
    if (result === 'applied') {
      reject(
        utils.buildErrObject(403, '????????????????????????????????????????????????????????????')
      )
    }
    if (result === 'undefined') {
      reject(utils.buildErrObject(403, '???????????????????????????????????????'))
    }
    resolve(true)
  })
}

const isDisplayNameMatched = async (inputDisplayName, DbDisplayName) => {
  return new Promise((resolve, reject) => {
    if (inputDisplayName !== DbDisplayName) {
      reject(utils.buildErrObject(409, '?????????????????????????????????'))
    }
    resolve(true)
  })
}

const isApplyUnlockNeeded = async user => {
  return new Promise((resolve, reject) => {
    const result = loginStatus(user.loginAttempts, user.isApplyUnlock)

    if (result === 'pass') {
      reject(utils.buildErrObject(409, '??????????????????????????????????????????'))
    }
    if (result === 'applied') {
      reject(
        utils.buildErrObject(409, '????????????????????????????????????????????????????????????')
      )
    }
    if (result === 'undefined') {
      reject(utils.buildErrObject(409, '???????????????????????????????????????'))
    }
    resolve(true)
  })
}

/**
 * Checks if veriycode from user is right
 * @param {Object} user - user object
 */
const isVerifycodeRight = async (verifyCode, captcha) => {
  return new Promise((resolve, reject) => {
    if (!captcha || verifyCode.toLowerCase() !== captcha) {
      reject(utils.buildErrObject(409, '????????????????????????'))
    }
    resolve(true)
  })
}

/**
 * Checks if veriycode from user is right
 * @param {Object} user - user object
 */
const isEmailVerifyPass = async isVerified => {
  return new Promise((resolve, reject) => {
    if (!isVerified) {
      reject(utils.buildErrObject(409, '????????????????????????Email?????????????????????'))
    }
    resolve(true)
  })
}

/**
 * Checks if password length from user is right
 * @param {Object} user - user object
 */
const isPasswordValidate = async password => {
  return new Promise((resolve, reject) => {
    if (password.length < 12) {
      reject(utils.buildErrObject(409, '?????????????????????12???'))
    }
    resolve(true)
  })
}

/**
 * Finds user by email
 * @param {string} email - user??s email
 */
const findUser = async email => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        email
      },
      // 'password loginAttempts blockExpires displayName photoURL email role verified verification shortcuts active balance',
      '+password +verification +loginAttempts +blockExpires -updatedAt -createdAt',
      (err, item) => {
        utils.itemNotFound(err, item, reject, '????????????????????????')
        resolve(item)
      }
    )
  })
}

exports.loginStatus = loginStatus

/**
 * Finds google user by email
 * @param {string} email - user??s google email
 */
const findGoogleUser = async email => {
  return new Promise((resolve, reject) => {
    // eslint-disable-line
    User.findOne(
      {
        'google.email': email
      },
      // 'password loginAttempts blockExpires displayName photoURL email role verified verification shortcuts active balance google.id google.accessToken google.displayName google.email google.photoURL facebook.id facebook.accessToken facebook.displayName facebook.email facebook.photoURL',
      (err, item) => {
        if (err) {
          resolve(null)
        }
        resolve(item)
      }
    )
  })
}

/**
 * Finds Facebook user by email
 * @param {string} email - user??s facebook email
 */
const findFacebookUser = async email => {
  return new Promise((resolve, reject) => {
    // eslint-disable-line
    User.findOne(
      {
        'facebook.email': email
      },
      // 'password loginAttempts blockExpires displayName photoURL email role verified verification shortcuts active balance google.id google.accessToken google.displayName google.email google.photoURL facebook.id facebook.accessToken facebook.displayName facebook.email facebook.photoURL',
      (err, item) => {
        if (err) {
          resolve(null)
        }
        resolve(item)
      }
    )
  })
}

/**
 * Login Google function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const loginGoogle = async (req, res, user) => {
  try {
    /* Sign-In */
    user.loginAttempts = 0
    await saveLoginAttemptsToDB(user)
    res.status(200).json(await saveUserAccessAndReturnToken({ req, user }))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Link Google account to user with id
 * @param {string} user - user??s id
 * @param {string} googleInfo - user??s google info
 */
const LinkGoogleAccountToUser = async (user, googleInfo) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      user._id,
      {
        google: {
          id: googleInfo.googleID,
          accessToken: googleInfo.googleAccessToken,
          displayName: googleInfo.googleDisplayName,
          email: googleInfo.googleEmail,
          photoURL: googleInfo.googlePhotoURL
        }
      },
      {
        new: true,
        runValidators: true,
        select: '-_id -updatedAt -createdAt'
      },
      (err, item) => {
        utils.itemNotFound(err, item, reject, { email: '?????????????????????' })
        resolve(item)
      }
    )
  })
}

/**
 * Login Facebook function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
const loginFacebook = async (req, res, user) => {
  try {
    /* Sign-In */
    user.loginAttempts = 0
    await saveLoginAttemptsToDB(user)
    res.status(200).json(await saveUserAccessAndReturnToken({ req, user }))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Link Facebook account to user with id
 * @param {string} user - user??s id
 * @param {string} facebookInfo - user??s facebook info
 */
const LinkFacebookAccountToUser = async (user, facebookInfo) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      user._id,
      {
        facebook: {
          id: facebookInfo.facebookID,
          accessToken: facebookInfo.facebookAccessToken,
          displayName: facebookInfo.facebookDisplayName,
          email: facebookInfo.facebookEmail,
          photoURL: facebookInfo.facebookPhotoURL
        }
      },
      {
        new: true,
        runValidators: true,
        select: '-_id -updatedAt -createdAt'
      },
      (err, item) => {
        utils.itemNotFound(err, item, reject, { email: '?????????????????????' })
        resolve(item)
      }
    )
  })
}

/**
 * Finds user by ID
 * @param {string} id - user??s id
 */
const findUserById = async userId => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, item) => {
      utils.itemNotFound(err, item, reject, { email: '?????????????????????' })
      resolve(item)
    })
  })
}

/**
 * Adds one attempt to loginAttempts, then compares loginAttempts with the constant LOGIN_ATTEMPTS, if is less returns wrong password, else returns blockUser function
 * @param {Object} user - user object
 */
const passwordsDoNotMatch = async user => {
  user.loginAttempts += 1
  await saveLoginAttemptsToDB(user)
  return new Promise((resolve, reject) => {
    resolve(utils.buildErrObject(409, '??????????????????????????????'))
  })
}

/**
 * ????????????????????????????????????????????????
 */
const passwordsIsSameWithUsed = async () => {
  return new Promise((resolve, reject) => {
    resolve(utils.buildErrObject(409, '????????????????????????????????????, ???????????????'))
  })
}

/**
 * ???????????????????????????????????????????????????
 */
const passwordsMatchRegex = async () => {
  return new Promise((resolve, reject) => {
    resolve(utils.buildErrObject(409, '??????????????? 12 ????????????????????????????????????'))
  })
}

/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
const registerUser = async req => {
  return new Promise((resolve, reject) => {
    const user = new User({
      displayName: req.displayName,
      email: req.email,
      password: req.password,
      verification: uuid.v4()
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
const csvregisterUser = async req => {
  return new Promise((resolve, reject) => {
    const user = new User({
      displayName: req.displayname,
      email: req.email,
      password: req.email.split('@')[0] + req.birthday,
      verification: uuid.v4()
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Registers a new google user in database
 * @param {Object} req - request object
 */
const registerGoogleUser = async req => {
  return new Promise((resolve, reject) => {
    const user = new User({
      displayName: req.googleDisplayName,
      email: req.googleEmail,
      photoURL: req.googlePhotoURL,
      verification: uuid.v4(),
      google: {
        id: req.googleID,
        accessToken: req.googleAccessToken,
        displayName: req.googleDisplayName,
        email: req.googleEmail,
        photoURL: req.googlePhotoURL
      }
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Registers a new Facebook user in database
 * @param {Object} req - request object
 */
const registerFacebookUser = async req => {
  return new Promise((resolve, reject) => {
    const user = new User({
      displayName: req.facebookDisplayName,
      email: req.facebookEmail,
      photoURL: req.facebookPhotoURL,
      verification: uuid.v4(),
      facebook: {
        id: req.facebookID,
        accessToken: req.facebookAccessToken,
        displayName: req.facebookDisplayName,
        email: req.facebookEmail,
        photoURL: req.facebookPhotoURL
      }
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Checks if verification id exists for user
 * @param {string} id - verification id
 */
const verificationExists = async id => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        verification: id,
        verified: false
      },
      (err, user) => {
        utils.itemNotFound(err, user, reject, '??????????????????????????????')
        resolve(user)
      }
    )
  })
}

/**
 * Verifies an user
 * @param {Object} user - user object
 */
const verifyUser = async user => {
  return new Promise((resolve, reject) => {
    user.verified = true
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve({
        email: item.email,
        verified: item.verified
      })
    })
  })
}

/**
 * Marks a request to reset password as used
 * @param {Object} req - request object
 * @param {Object} forgot - forgot object
 */
const markResetPasswordAsUsed = async (req, forgot) => {
  return new Promise((resolve, reject) => {
    forgot.used = true
    forgot.ipChanged = utils.getIP(req)
    forgot.browserChanged = utils.getBrowserInfo(req)
    forgot.countryChanged = utils.getCountry(req)
    forgot.save((err, item) => {
      utils.itemNotFound(err, item, reject, 'NOT_FOUND')
      resolve(utils.buildSuccObject('PASSWORD_CHANGED'))
    })
  })
}

/**
 * Updates a user password in database
 * @param {string} password - new password
 * @param {Object} user - user object
 */
const updatePassword = async (password, user) => {
  const newUsedPassword2 = user.usedPassword1
  const newUsedPassword1 = user.password

  return new Promise((resolve, reject) => {
    user.password = password
    user.usedPassword1 = newUsedPassword1
    user.usedPassword2 = newUsedPassword2
    user.lastPasswordUpdatedAt = Date.now()
    user.loginAttempts = 0
    user.isApplyUnlock = false
    user.blockExpires = Date.now()
    user.save((err, item) => {
      utils.itemNotFound(err, item, reject, 'NOT_FOUND')
      resolve(item)
    })
  })
}

/**
 * Finds user by email to reset password
 * @param {string} email - user email
 */
const findUserToResetPassword = async email => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        email
      },
      '+password +usedPassword1 +usedPassword2 +verification +loginAttempts +blockExpires -updatedAt -createdAt',
      (err, user) => {
        utils.itemNotFound(err, user, reject, 'NOT_FOUND')
        resolve(user)
      }
    )
  })
}

/**
 * Checks if a forgot password verification exists
 * @param {string} id - verification id
 */
const findForgotPassword = async id => {
  return new Promise((resolve, reject) => {
    ForgotPassword.findOne(
      {
        verification: id,
        used: false
      },
      (err, item) => {
        utils.itemNotFound(err, item, reject, 'NOT_FOUND_OR_ALREADY_USED')
        resolve(item)
      }
    )
  })
}

/**
 * Creates a new password forgot
 * @param {Object} req - request object
 */
const saveForgotPassword = async req => {
  return new Promise((resolve, reject) => {
    const forgot = new ForgotPassword({
      email: req.body.email,
      verification: uuid.v4(),
      ipRequest: utils.getIP(req),
      browserRequest: utils.getBrowserInfo(req),
      countryRequest: utils.getCountry(req)
    })
    forgot.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * apply for unlock user account
 * @param {Object} req - request object
 */
const applyUnlock = async req => {
  return new Promise((resolve, reject) => {
    const apply = new ApplyUnlock({
      email: req.body.email,
      verification: uuid.v4(),
      ipRequest: utils.getIP(req),
      browserRequest: utils.getBrowserInfo(req),
      countryRequest: utils.getCountry(req)
    })
    apply.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Builds an object with created forgot password object, if env is development or testing exposes the verification
 * @param {Object} item - created forgot password object
 */
const forgotPasswordResponse = item => {
  let data = {
    msg: 'RESET_EMAIL_SENT',
    email: item.email
  }
  if (process.env.NODE_ENV !== 'production') {
    data = {
      ...data,
      verification: item.verification
    }
  }
  return data
}

/**
 * Checks against user if has quested role
 * @param {Object} data - data object
 * @param {*} next - next callback
 */
const checkPermissions = async (data, next) => {
  return new Promise((resolve, reject) => {
    User.findById(data.id, (err, result) => {
      utils.itemNotFound(err, result, reject, 'NOT_FOUND')
      if (data.roles.indexOf(result.role) > -1) {
        return resolve(next())
      }
      return reject(utils.buildErrObject(401, 'UNAUTHORIZED'))
    })
  })
}

/**
 * Gets user id from token
 * @param {string} token - Encrypted and encoded token
 */
const getUserIdFromToken = async token => {
  return new Promise((resolve, reject) => {
    // Decrypts, verifies and decode token
    // jwt.verify(auth.decrypt(token), process.env.JWT_SECRET, (err, decoded) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(utils.buildErrObject(409, 'BAD_TOKEN'))
      }
      resolve(decoded.data._id)
    })
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.login = async (req, res) => {
  try {
    const captcha = req.session.captcha
    req.session.captcha = null
    const data = matchedData(req)
    // 0.??????????????????????????????12???
    await isPasswordValidate(data.password)

    const user = await findUser(data.email)
    // 0.?????????????????????Email??????
    await isEmailVerifyPass(user.verified)
    // 1.???????????????????????????
    await isVerifycodeRight(data.verifyCode, captcha)
    // 2.??????????????????????????????
    await userIsBlocked(user)
    // 3.???????????????????????????
    await checkLoginAttemptsAndBlockExpires(user)
    // 4.??????????????????????????????
    const isPasswordMatch = auth.checkPassword(data.password, user)
    if (!isPasswordMatch) {
      const newReq = { ...req }
      newReq.path = '/login-fail'
      await saveUserAccessAndReturnToken({ req: newReq, user })
      utils.handleError(res, await passwordsDoNotMatch(user))
    } else {
      // all ok, register access and return token
      user.loginAttempts = 0
      user.isApplyUnlock = false
      await saveLoginAttemptsToDB(user)
      res.status(200).json(await saveUserAccessAndReturnToken({ req, user }))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Sign with Google function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.signWithGoogle = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findGoogleUser(data.googleEmail)
    if (user) {
      /* Sign-In */
      await userIsBlocked(user)
      await checkLoginAttemptsAndBlockExpires(user)
      loginGoogle(req, res, user)
    } else {
      /* Sign-Up */
      const locale = req.getLocale()
      const doesEmailExists = await emailer.emailExists(data.googleEmail)
      if (!doesEmailExists) {
        const newUser = await registerGoogleUser(data)
        emailer.sendRegistrationEmailMessage(locale, newUser)
        res
          .status(200)
          .json(await saveUserAccessAndReturnToken({ req, user: newUser }))
      }
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Sign with Facebook function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.signWithFacebook = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findFacebookUser(data.facebookEmail)
    if (user) {
      /* Sign-In */
      await userIsBlocked(user)
      await checkLoginAttemptsAndBlockExpires(user)
      loginFacebook(req, res, user)
    } else {
      /* Sign-Up */
      const locale = req.getLocale()
      const doesEmailExists = await emailer.emailExists(data.facebookEmail)
      if (!doesEmailExists) {
        const newUser = await registerFacebookUser(data)
        emailer.sendRegistrationEmailMessage(locale, newUser)
        res
          .status(200)
          .json(await saveUserAccessAndReturnToken({ req, user: newUser }))
      }
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Link Google account function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.linkGoogle = async (req, res) => {
  try {
    const data = matchedData(req)
    const hasGoogleUser = await findGoogleUser(data.googleEmail)
    if (req.user.google === null && !hasGoogleUser) {
      /* Link account */
      const item = await LinkGoogleAccountToUser(req.user, data)
      const linkedUser = setUserInfo(item)
      res.status(200).json(linkedUser)
    } else {
      const error = new Error()
      error.code = 422
      error.message = '?????? Google ??????'
      utils.handleError(res, error)
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Link Facebook account function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.linkFacebook = async (req, res) => {
  try {
    const data = matchedData(req)
    const hasFacebookUser = await findFacebookUser(data.facebookEmail)
    if (req.user.facebook === null && !hasFacebookUser) {
      /* Link account */
      const item = await LinkFacebookAccountToUser(req.user, data)
      const linkedUser = setUserInfo(item)
      res.status(200).json(linkedUser)
    } else {
      const error = new Error()
      error.code = 422
      error.message = '?????? Facebook ??????'
      utils.handleError(res, error)
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.register = async (req, res) => {
  try {
    // Gets locale from header 'Accept-Language'
    const locale = req.getLocale()
    const data = matchedData(req)
    const doesEmailExists = await emailer.emailExists(data.email)
    if (!doesEmailExists) {
      const user = await registerUser(data)
      // const userInfo = setUserInfo(user)
      // const response = returnRegisterToken(user, userInfo)
      emailer.sendRegistrationEmailMessage(locale, user)
      // res.status(201).json(response)
      res.status(200).json(await saveUserAccessAndReturnToken({ req, user }))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.csvregister = async (req, res) => {
  for (const i in req.body) {
    try {
      // Gets locale from header 'Accept-Language'
      const locale = req.getLocale()
      const data = req.body[i]
      const doesEmailExists = await emailer.emailExists(data.email)
      if (!doesEmailExists) {
        const user = await csvregisterUser(data)
        emailer.sendRegistrationEmailMessage(locale, user)
        // res.status(201).json(response)
        res.status(200).json(await saveUserAccessAndReturnToken({ req, user }))
      }
    } catch (error) {
      utils.handleError(res, error)
    }
  }
}

/**
 * Verify email function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verifyEmail = async (req, res) => {
  try {
    const user = await verificationExists(req.params.vid)
    await verifyUser(user)
    res.redirect(`${process.env.FRONTEND_URL}/user/personal-settings/edit`)
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/user/personal-settings`)
    utils.handleError(res, error)
  }
}
/**
 * Resend verify email function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.resendVerifyEmail = async (req, res) => {
  try {
    const locale = req.getLocale()
    const user = await findUser(req.user.email)

    emailer.sendRegistrationEmailMessage(locale, user)

    res.status(200).json({ message: 'resend verify email succeeded!' })
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * randomly return a new password in terms of length
 */
const generatePassword = length => {
  let result = ''
  const characters = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

/**
 * Forgot password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
// eslint-disable-next-line max-statements
exports.forgotPassword = async (req, res) => {
  try {
    // Gets locale from header 'Accept-Language'
    const captcha = req.session.captcha
    req.session.captcha = null
    const locale = req.getLocale()
    const data = matchedData(req)
    // 1.???????????????????????????
    await isVerifycodeRight(data.verifyCode, captcha)
    const user = await findUser(data.email)
    const item = await saveForgotPassword(req)
    const newPassword = generatePassword(12)

    console.log(newPassword)

    user.isSystemPassword = true
    user.verified = true
    await updatePassword(newPassword, user)
    const userData = {
      email: item.email,
      verification: item.verification,
      displayName: user.displayName,
      password: newPassword
    }
    emailer.sendNewPasswordEmailMessage(locale, userData)
    res.status(200).json(forgotPasswordResponse(item))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Forgot password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.applyUnlock = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findUser(data.email)
    // 1.??????displayName?????????email??????
    await isDisplayNameMatched(data.displayName, user.displayName)
    // 2.??????????????????????????????
    await isApplyUnlockNeeded(user)

    // 2.??????applyUnlock
    const item = await applyUnlock(req)
    // 3.??????users.isApplyUnlock???true
    user.isApplyUnlock = true
    await saveLoginAttemptsToDB(user)

    res.status(200).json(forgotPasswordResponse(item))
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.checkIsApplyUnlock = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findUser(data.email)
    const result = await loginStatus(user.loginAttempts, user.isApplyUnlock)
    res.status(200).json(result)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Reset password function called by route (self reset)
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.resetPassword = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findUserToResetPassword(req.user.email)
    const newPassword = data.password
    // 1.???????????????????????????????????????
    const isPasswordSame = await auth.checkPassword(newPassword, user)
    // 2.????????????????????????????????????????????????
    const isPassword1Same = await auth.checkPassword1(newPassword, user)
    // 3.????????????????????????????????????????????????
    const isPassword2Same = await auth.checkPassword2(newPassword, user)
    // 4.?????????????????????????????????????????????
    const isRegexMatch = newPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+$/)

    if (isPasswordSame || isPassword1Same || isPassword2Same) {
      utils.handleError(res, await passwordsIsSameWithUsed())
    } else if (!isRegexMatch) {
      utils.handleError(res, await passwordsMatchRegex())
    } else {
      user.isSystemPassword = false
      const newUser = await updatePassword(newPassword, user)
      res.status(200).json({
        message: '????????????????????????',
        newUser: {
          active: newUser.active,
          data: newUser,
          from: 'm-lab-db',
          role: newUser.role,
          uuid: newUser._id,
          verification: newUser.verification,
          verified: newUser.verified
        }
      })
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.adminResetPassword = async (req, res) => {
  try {
    const data = matchedData(req)
    // const forgotPassword = await findForgotPassword(data.id)
    // const user = await findUserToResetPassword(forgotPassword.email)
    const user = await findUserToResetPassword(data.email)
    user.isSystemPassword = true
    await updatePassword(data.password, user)
    // const result = await markResetPasswordAsUsed(req, forgotPassword)
    // res.status(200).json(result)
    res.status(200).json({ message: '????????????????????????' })
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Refresh token function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getRefreshToken = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()
    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await utils.isIDGood(userId)
    const user = await findUserById(userId)
    const token = await saveUserAccessAndReturnToken({ req, user })
    // Removes user info from response
    delete token.user
    res.status(200).json(token)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Refresh token function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.loginWithAccessToken = async (req, res) => {
  try {
    const tokenEncrypted = req.headers.authorization
      .replace('Bearer ', '')
      .trim()
    let userId = await getUserIdFromToken(tokenEncrypted)
    userId = await utils.isIDGood(userId)
    const user = await findUserById(userId)
    const userWithToken = await saveUserAccessAndReturnToken({
      req,
      user,
      byToken: true
    })
    // Removes user info from response
    // delete userWithToken.user
    res.status(200).json(userWithToken)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Roles authorization function called by route
 * @param {Array} roles - roles specified on the route
 */
exports.roleAuthorization = roles => async (req, res, next) => {
  try {
    const data = {
      id: req.user._id,
      email: req.user.email,
      roles
    }
    await saveUserAccess(req, data)
    await checkPermissions(data, next)
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.getCaptcha = async (req, res) => {
  try {
    const captcha = svgCaptcha.create({
      color: true, // ????????????
      fontSize: 72, // ????????????
      noise: 3, // ???????????????
      width: 300, // ??????
      height: 150, // ??????
      ignoreChars: '0o1iIl' // ??????????????????
    })
    // ?????????session,???????????????
    req.session.captcha = captcha.text.toLowerCase()
    res.status(200).json({ img: String(captcha.data) })
  } catch (error) {
    utils.handleError(res, error)
  }
}
