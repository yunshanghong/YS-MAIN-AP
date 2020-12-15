const controller = require('../controllers/news')
const validate = require('../controllers/news.validate')
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
 * Home page News routes
 */
/*
 * Get all news route
 */
router.get(
  '/',
  trimRequest.all,
  controller.getItems
)
/*
 * Get single news by newsId route
 */
router.get(
  '/:newsId',
  trimRequest.all,
  validate.getItem,
  controller.getItem
)
/*
 * Add new news route
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
 * Update news route
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
 * Delete news route
 */
router.post(
  '/:newsId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
