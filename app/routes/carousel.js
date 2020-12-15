const controller = require('../controllers/carousel')
const validate = require('../controllers/carousel.validate')
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
 * Home page Carousel routes
 */
/*
 * Get all carousels route
 */
router.get(
  '/',
  trimRequest.all,
  controller.getAllItems
)
/*
 * Add new carousel route
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
 * Update carousel route
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
 * Delete carousel route
 */
router.post(
  '/:carouselId',
  requireAuth,
  AuthController.roleAuthorization(authRoles.staff),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
