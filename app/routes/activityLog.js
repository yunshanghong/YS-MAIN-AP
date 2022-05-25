const controller = require('../controllers/activityLog')
const validate = require('../controllers/activityLog.validate')
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
 * Get self all event registration log by user id route
 */
router.get(
  '/self',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  controller.getItemsBySelfId
)
/*
 * Get User's all event registration log by user id route
 */
router.get(
  '/user/:userId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.getItemsByUserId,
  controller.getItemsByUserId
)
/*
 * Get Event's all user registration log by event id route
 */
router.get(
  '/event/:eventId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.getItemsByEventId,
  controller.getItemsByEventId
)

/*
 * Get Event's all user registration log by event id route
 */
router.get(
  '/eventCount/:eventId',
  requireAuth,
  validate.getCountsByEventId,
  controller.getCountsByEventId
)

/*
 * Add new activity log route
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
 * apply activity again log route
 */
router.post(
  '/applyAgain',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.applyAgain,
  controller.applyAgain
)
/*
 * Update activity Log route
 */
router.post(
  '/update',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)
/*
 * Update user checkin status route
 */
router.post(
  '/event/checkinStatus/:updateAction',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.updateCheckinStatusItem,
  controller.updateCheckinStatusItem
)
/*
 * Update user registration status route
 */
router.post(
  '/event/registration/:updateAction',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.updateRegistrationItem,
  controller.updateRegistrationItem
)
/*
 * Cancel activity apply route
 */
router.post(
  '/event/cancel',
  requireAuth,
  AuthController.roleAuthorization(authRoles.user),
  trimRequest.all,
  validate.cancelItem,
  controller.cancelItem
)

module.exports = router
