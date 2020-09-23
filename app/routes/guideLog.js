const controller = require('../controllers/guideLog')
const validate = require('../controllers/guideLog.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')
const authRoles = require('../middleware/authRoles')

/*
 * Space Guide log history routes
 * purposes
 *  - get user's guide history
 *  - get space's guide history
 */
/*
 * Get all space guide log route. (No login required)
 */
router.get('/', trimRequest.all, controller.getItems)
/*
 * Get self all guide log by user id route
 */
router.get(
  '/self',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  controller.getItemsBySelfId
)

/*
 * Add new guide log route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)

/*
 * Checkin guide Log route. (Only staff above)
 */
router.post(
  '/checkin',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.checkinItem,
  controller.checkinItem
)
/*
 * Update guide Log route. (Only staff above)
 */
router.post(
  '/update',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)
/*
 * Cancel self guide Log route.
 */
router.post(
  '/cancel',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.cancelItem,
  controller.cancelItem
)

module.exports = router
