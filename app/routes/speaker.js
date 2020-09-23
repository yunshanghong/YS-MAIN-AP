const controller = require('../controllers/speaker')
const validate = require('../controllers/speaker.validate')
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
 * Home page Speaker list routes
 */
/*
 * Get all Speakers route
 */
router.get(
  '/',
  // requireAuth,
  // AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  controller.getItems
)
/*
 * Get single speaker by speakerId route
 */
router.get(
  '/:speakerId',
  // requireAuth,
  // AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  validate.getItem,
  controller.getItem
)
/*
 * Add new speaker route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)
/*
 * Update speaker route
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
 * Delete speaker route
 */
router.delete(
  '/:speakerId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
