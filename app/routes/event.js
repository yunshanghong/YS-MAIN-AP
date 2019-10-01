const controller = require('../controllers/event')
const validate = require('../controllers/event.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Home page Event List routes
 */
/*
 * Get all Events route
 */
router.get(
  '/',
  trimRequest.all,
  controller.getItems
)
/*
 * Get single enent by enentId route
 */
router.get(
  '/:eventId',
  trimRequest.all,
  validate.getItem,
  controller.getItem
)
/*
 * Add new enent route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)
/*
 * Update enent route
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
 * Delete enent route
 */
router.delete(
  '/:enentId',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router