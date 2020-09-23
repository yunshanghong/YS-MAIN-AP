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
const authRoles = require('../middleware/authRoles')

/*
 * Auth routes
 */


/*
* Captcha img route
*/
router.get(
  '/getCaptcha',
  trimRequest.all, 
  controller.getCaptcha,
)

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
 * Re-Send Verify Email token
 */
router.post(
  '/resend-verify',
  requireAuth,
  controller.roleAuthorization(authRoles.user),
  trimRequest.all,
  controller.resendVerifyEmail
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
 * apply unlock user account route
 */
router.post(
  '/applyUnlock',
  trimRequest.all,
  validate.applyUnlock,
  controller.applyUnlock
)

/*
 * apply unlock user account route
 */
router.post(
  '/checkIsApplyUnlock',
  trimRequest.all,
  validate.checkIsApplyUnlock,
  controller.checkIsApplyUnlock,
)

/*
 * Reset password route
 */
router.post(
  '/reset',
  requireAuth,
  controller.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.resetPassword,
  controller.resetPassword
)

/*
 * Admin reset password route
 */
router.post(
  '/admin-reset',
  requireAuth,
  controller.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.adminResetPassword,
  controller.adminResetPassword
)

/*
 * Get new refresh token
 */
router.post(
  '/refresh-token',
  requireAuth,
  controller.roleAuthorization(authRoles.user),
  trimRequest.all,
  controller.getRefreshToken
)

/*
 * Login with access-token token
 */
router.post(
  '/access-token',
  requireAuth,
  controller.roleAuthorization(authRoles.user),
  trimRequest.all,
  controller.loginWithAccessToken
)

/*
 * Connect Account with Google account
 */
router.post(
  '/link/google',
  requireAuth,
  controller.roleAuthorization(authRoles.user),
  validate.signWithGoogle,
  controller.linkGoogle
)

/*
 * Connect Account with Facebook account
 */
router.post(
  '/link/facebook',
  requireAuth,
  controller.roleAuthorization(authRoles.user),
  validate.signWithFacebook,
  controller.linkFacebook
)

/*
 * Login Route
 */
router.post('/login',trimRequest.all, validate.login, controller.login)

/*
 * Login Googel Route
 */
router.post(
  '/login/google',
  trimRequest.all,
  validate.signWithGoogle,
  controller.signWithGoogle
)

/*
 * Login Facebook Route
 */
router.post(
  '/login/facebook',
  trimRequest.all,
  validate.signWithFacebook,
  controller.signWithFacebook
)

module.exports = router
