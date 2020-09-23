const controller = require('../controllers/profile')
const validate = require('../controllers/profile.validate')
const AuthController = require('../controllers/auth')
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
 * Profile routes
 */

/*
 * Get profile route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  controller.getProfile
)

/*
 * Update profile route
 */
router.post(
  '/update',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.updateProfile,
  controller.updateProfile
)

/*
 * Update profile shortcuts route
 */
router.patch(
  '/shortcuts',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.updateProfileShortcuts,
  controller.updateProfileShortcuts
)

/*
 * Change password route
 */
router.post(
  '/changePassword',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.changePassword,
  controller.changePassword
)

/*
 * User's access history routes
 */
router.post(
  '/access-history',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  controller.getAccesses
)

module.exports = router
