const controller = require('../controllers/information')
const validate = require('../controllers/information.validate')
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
 * Home page Information list routes
 */
/*
 * Get all information route
 */
router.get(
  '/',
  trimRequest.all,
  controller.getItems
)
/*
 * Get single information by informationId route
 */
router.get(
  '/:informationId',
  trimRequest.all,
  validate.getItem,
  controller.getItem
)
/*
 * Add new information route
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
 * Update information route
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
 * Delete information route
 */
router.post(
  '/:informationId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
