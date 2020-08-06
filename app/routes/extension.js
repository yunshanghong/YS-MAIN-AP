const controller = require('../controllers/extension')
const validate = require('../controllers/extension.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Get extensions route
 */

router.get('/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'staff', 'admin']),
  trimRequest.all,
  controller.getItems,
)

/*
 * Add new extension route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  validate.createItem,
  controller.createItem,
)

/*
 * Update extension route
 */
router.post(
  '/update',
  requireAuth,
  AuthController.roleAuthorization(['staff', 'admin']),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)

module.exports = router
