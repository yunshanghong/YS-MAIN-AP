const controller = require('../controllers/borrowLog')
const validate = require('../controllers/borrowLog.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Space Borrow log history routes
 * purposes
 *  - get user's borrow history
 *  - get space's borrow history
 */
/*
 * Get all space borrow log route. (No login required)
 */
router.get('/', trimRequest.all, controller.getItems)
/*
 * Get self all borrow log by user id route
 */
router.get(
  '/self',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  controller.getItemsBySelfId
)

/*
 * Add new borrow log route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)
/*
 * Checkin borrow Log route. (Only staff above)
 */
router.post(
  '/checkin',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  validate.checkinItem,
  controller.checkinItem
)
/*
 * Update borrow Log route. (Only staff above)
 */
router.post(
  '/update',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)
/*
 * Cancel self borrow Log route.
 */
router.post(
  '/cancel',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  validate.cancelItem,
  controller.cancelItem
)

module.exports = router
