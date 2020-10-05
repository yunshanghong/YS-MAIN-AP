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
 * Event registration log history routes
 * purposes
 *  - get user's registration history
 *  - get event's registration history
 *  - get speaker's stars by user's reviews
 */
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
  trimRequest.all,
  validate.getItemsByEventId,
  controller.getItemsByEventId
)
/*
 * Get Speaker's stars by all user reviews by speaker id route
 */
// router.get(
//   '/speaker/stars/:speakerId',
//   requireAuth,
//   AuthController.roleAuthorization(['user', 'staff', 'admin']),
//   trimRequest.all,
//   validate.getSpeakerStarsBySpeakerId,
//   controller.getSpeakerStarsBySpeakerId
// )
/*
 * Get Event's stars by all user reviews by event id route
 */
// router.get(
//   '/event/stars/:eventId',
//   requireAuth,
//   AuthController.roleAuthorization(['user', 'staff', 'admin']),
//   trimRequest.all,
//   validate.getEventStarsByEventId,
//   controller.getEventStarsByEventId
// )

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
// /*
//  * Approve activity apply route
//  */
// router.post(
//   '/event/approve',
//   requireAuth,
//   AuthController.roleAuthorization(['staff', 'admin']),
//   trimRequest.all,
//   validate.approveItem,
//   controller.approveItem
// )
// /*
//  * Reject activity apply route
//  */
// router.post(
//   '/event/reject',
//   requireAuth,
//   AuthController.roleAuthorization(['staff', 'admin']),
//   trimRequest.all,
//   validate.rejectItem,
//   controller.rejectItem
// )

module.exports = router
