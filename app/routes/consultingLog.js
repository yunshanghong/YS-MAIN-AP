const controller = require('../controllers/consultingLog')
const validate = require('../controllers/consultingLog.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Get all consulting log route. (No login required)
 */
router.get('/public', trimRequest.all, controller.getPublicItems)
/*
 * Get all consulting log route. (login needed)
 */
router.get(
  '/secret',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getSecretItems
)
/*
 * Get self all guide log by user id route
 */
router.get(
  '/self',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  controller.getItemsBySelfId
)

/*
 * Add new guide log route
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
 * Update guide Log route. (Only staff above)
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
 * Cancel self guide Log route.
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