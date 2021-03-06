const nodemailer = require('nodemailer')
const Email = require('email-templates')
const path = require('path')
const i18n = require('i18n')
const User = require('../models/user')
const { itemAlreadyExists } = require('../middleware/utils')

/**
 * Sends email
 * @param {Object} data - data
 * @param {boolean} callback - callback
 */
const sendEmail = async (data, callback) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST, // SMTP server
    port: process.env.SMTP_SECURE_PORT, // secure SMTP
    secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
    auth: {
      user: process.env.EMAIL_SMTP_USER,
      pass: process.env.EMAIL_SMTP_PASS
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    },
    secureConnection: false
  })

  const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
    views: {
      root: path.resolve(__dirname, '../', '../', 'emails')
    }
  })

  email
    .send({
      template: data.template,
      message: {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: `${data.user.displayName} <${data.user.email}>`,
        subject: data.subject
      },
      locals: data.locals
    })
    .then(() => callback(true))
    .catch(() => callback(false))
}

/**
 * Prepares to send email
 * @param {string} user - user object
 * @param {string} subject - subject
 * @param {string} emailLocals - Email locals
 */
const prepareToSendEmail = (user, subject, template, emailLocals) => {
  const data = {
    user,
    subject,
    template,
    locals: emailLocals
  }
  // NOTE here
  // if (process.env.NODE_ENV === 'production') {
  //   sendEmail(data, messageSent =>
  //     messageSent
  //       ? console.log(`Email SENT to: ${user.email}`)
  //       : console.log(`Email FAILED to: ${user.email}`)
  //   )
  // } else if (process.env.NODE_ENV === 'development') {
  //   console.log(data)
  // }
  sendEmail(data, messageSent =>
    messageSent
      ? console.log(`Email SENT to: ${user.email}`)
      : console.log(`Email FAILED to: ${user.email}`)
  )
}

module.exports = {
  /**
   * Checks User model if user with an specific email exists
   * @param {string} email - user email
   */
  async emailExists(email) {
    return new Promise((resolve, reject) => {
      User.findOne(
        {
          email
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, {
            email: '???????????????????????????????????? YS (07)2313232'
          })
          resolve(false)
        }
      )
    })
  },

  /**
   * Checks User model if user with an specific email exists but excluding user id
   * @param {string} id - user id
   * @param {string} email - user email
   */
  async emailExistsExcludingMyself(id, email) {
    return new Promise((resolve, reject) => {
      User.findOne(
        {
          email,
          _id: {
            $ne: id
          }
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, {
            email: '???????????????????????????????????? YS (07)2313232'
          })
          resolve(false)
        }
      )
    })
  },

  /**
   * Sends registration email
   * @param {string} locale - locale
   * @param {Object} user - user object
   */
  async sendRegistrationEmailMessage(locale, user) {
    i18n.setLocale(locale)
    const subject = i18n.__('registration.SUBJECT')
    const emailTemplate = 'verify'
    const emailLocals = {
      HEADER: i18n.__('registration.HEADER'),
      DESCRIPTION: i18n.__('registration.DESCRIPTION'),
      LINK_TEXT: i18n.__('registration.LINK_TEXT'),
      HINT: i18n.__('registration.HINT'),
      VERIFY_URL: `${process.env.AUTH_API_END_POINT}/auth/verify-email/${user.verification}`,
      YEAR: `${new Date().getFullYear()}`
    }
    prepareToSendEmail(user, subject, emailTemplate, emailLocals)
  },

  /**
   * Sends reset password email
   * @param {string} locale - locale
   * @param {Object} user - user object
   */
  async sendResetPasswordEmailMessage(locale, user) {
    i18n.setLocale(locale)
    const subject = i18n.__('forgotPassword.SUBJECT')
    const emailTemplate = 'reset'
    const emailLocals = {
      HEADER: i18n.__('forgotPassword.HEADER'),
      DESCRIPTION: i18n.__('forgotPassword.DESCRIPTION'),
      LINK_TEXT: i18n.__('forgotPassword.LINK_TEXT'),
      HINT: i18n.__('forgotPassword.HINT'),
      RESET_URL: `${process.env.FRONTEND_URL}/reset-password/${user.verification}`,
      YEAR: `${new Date().getFullYear()}`
    }
    prepareToSendEmail(user, subject, emailTemplate, emailLocals)
  },

  /**
   * Sends new password email
   * @param {string} locale - locale
   * @param {Object} user - user object
   */
  async sendNewPasswordEmailMessage(locale, user) {
    i18n.setLocale(locale)
    const subject = i18n.__('newPassword.SUBJECT')
    const emailTemplate = 'new'
    const emailLocals = {
      HEADER: i18n.__('newPassword.HEADER'),
      DESCRIPTION: i18n.__('newPassword.DESCRIPTION'),
      LINK_TEXT: i18n.__('newPassword.LINK_TEXT'),
      HINT: i18n.__('newPassword.HINT'),
      NEW_PASS: `${user.password}`,
      YEAR: `${new Date().getFullYear()}`
    }
    prepareToSendEmail(user, subject, emailTemplate, emailLocals)
  }
}
