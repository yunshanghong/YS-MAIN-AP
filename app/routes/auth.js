const controller = require('../controllers/auth')
const validate = require('../controllers/auth.validate')
const express = require('express')
const router = express.Router()
// require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Auth routes
 */

/*
 * Register route
 */
router.post(
  '/register',
  trimRequest.all,
  validate.register,
  controller.register
)

/*
 * Verify Email route
 */
router.get('/verify-email/:vid', trimRequest.all, controller.verifyEmail)

/*
 * Forgot password route
 */
router.post(
  '/forgot',
  trimRequest.all,
  validate.forgotPassword,
  controller.forgotPassword
)

/*
 * Reset password route
 */
router.post(
  '/reset',
  trimRequest.all,
  validate.resetPassword,
  controller.resetPassword
)

/*
 * Get new refresh token
 */
router.post(
  '/refresh-token',
  requireAuth,
  controller.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  controller.getRefreshToken
)

/*
 * Login with access-token token
 */
router.post(
  '/access-token',
  requireAuth,
  controller.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  controller.loginWithAccessToken
)

/*
 * Login Route
 */
router.post('/login', trimRequest.all, validate.login, controller.login)

module.exports = router
